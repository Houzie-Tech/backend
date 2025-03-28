/* eslint-disable no-unused-vars */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OTPService } from '../otp/otp.service';
import { JwtService } from '@nestjs/jwt';
import { $Enums, OTPType, Role } from '@prisma/client';
import { otp, auth } from './dto';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { LoginEmailDto } from './dto/email_pw.dto';
import { randomBytes } from 'crypto';
import { MailerService } from 'src/mail/mail.service';

//TODO implement timeout for email and otp

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OTPService,
    private mailerService: MailerService,
  ) {}

  async register(registerDto: auth.RegisterAuthDto) {
    const logger = new Logger('AuthService.register');

    try {
      const {
        provider,
        providerId,
        password,
        email,
        phoneNumber,
        aadharNumber,
        ...userData
      } = registerDto;
      // Check for existing user with the same email, phone number, or aadhar number.
      const uniqueConditions = [];
      if (email) uniqueConditions.push({ email });
      if (phoneNumber) uniqueConditions.push({ phoneNumber });
      if (aadharNumber) uniqueConditions.push({ aadharNumber });

      if (uniqueConditions.length) {
        const existingUser = await this.prisma.user.findFirst({
          where: { OR: uniqueConditions },
        });
        if (existingUser) {
          throw new BadRequestException({
            status: 'fail',
            message:
              'A user with the provided email, phone number, or aadhar number already exists.',
          });
        }
      }

      // For regular registrations, hash the password.
      let hashedPassword: string | null = null;
      if (!provider && password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      // Create the user and associated authentication details.
      const user = await this.prisma.user.create({
        data: {
          email,
          phoneNumber,
          aadharNumber,
          ...userData,
          userAuth: {
            create: {
              provider: provider || null,
              providerId: providerId || null,
              password: hashedPassword, // Will be null for OAuth registrations.
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          role: true,
          userAuth: {
            select: {
              id: true,
              provider: true,
              providerId: true,
            },
          },
        },
      });

      logger.log(`User created with id: ${user.id}`);

      // For non-OAuth registrations, send verification OTPs if email and/or phone number are provided.
      if (!provider) {
        const otpPromises = [];
        if (email) {
          otpPromises.push(
            this.otpService.createOTP(user.userAuth.id, OTPType.EMAIL),
          );
        }
        if (phoneNumber) {
          otpPromises.push(
            this.otpService.createOTP(user.userAuth.id, OTPType.PHONE),
          );
        }
        if (otpPromises.length > 0) {
          await Promise.all(otpPromises);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userAuth, ...data } = user;

      return {
        status: 'success',
        data: {
          user: data,
        },
      };
    } catch (error) {
      logger.error('Error during user registration', error.stack);

      // Handle Prisma unique constraint violation
      if (error.code === 'P2002') {
        throw new BadRequestException({
          status: 'fail',
          message: `A user with this ${error.meta.target} already exists.`,
        });
      }

      // If it's already a NestJS exception, rethrow it
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new InternalServerErrorException({
        status: 'error',
        message:
          'An error occurred during user registration. Please try again.',
      });
    }
  }

  async loginEmail(loginDto: LoginEmailDto) {
    const logger = new Logger('AuthService.loginEmail');

    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
        select: {
          id: true,
          userAuth: {
            select: {
              id: true,
              password: true,
              isEmailVerified: true,
              isPhoneVerified: true,
            },
          },
          email: true,
          phoneNumber: true,
          name: true,
          role: true,
          aadharNumber: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!user) {
        throw new UnauthorizedException({
          status: 'fail',
          message: 'Invalid email or password',
        });
      }

      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.userAuth.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException({
          status: 'fail',
          message: 'Invalid email or password',
        });
      }

      const tokens = await this.generateTokens(user);

      return {
        status: 'success',
        message: 'Login successful',
        ...tokens,
      };
    } catch (error) {
      logger.error('Error during login', error.stack);

      // If it's already a NestJS exception, rethrow it
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException({
        status: 'error',
        message: 'An error occurred during login. Please try again.',
      });
    }
  }

  async initiateOtp(loginInitiateDto: otp.InitiateOtpDto) {
    const logger = new Logger('AuthService.initateOtp');

    try {
      // Validate that either email OR phone number is provided, but not both.
      if (
        (!loginInitiateDto.email && !loginInitiateDto.phoneNumber) ||
        (loginInitiateDto.email && loginInitiateDto.phoneNumber)
      ) {
        throw new BadRequestException({
          message: 'Provide either email or phone number, but not both.',
        });
      }

      let user;
      let otp;
      let loginMethod = '';

      if (loginInitiateDto.email) {
        // Retrieve the user based on email.
        user = await this.prisma.user.findUnique({
          where: { email: loginInitiateDto.email },
          select: {
            id: true,
            userAuth: { select: { id: true, isEmailVerified: true } },
          },
        });
        if (!user) {
          throw new UnauthorizedException({
            message: 'Invalid email or OTP',
          });
        }
        // Create and send email OTP.
        otp = await this.otpService.createOTP(user.userAuth.id, OTPType.EMAIL);
        await this.otpService.sendEmailOTP(loginInitiateDto.email, otp);
        loginMethod = 'email';
      } else if (loginInitiateDto.phoneNumber) {
        // Retrieve the user based on phone number.
        user = await this.prisma.user.findUnique({
          where: { phoneNumber: loginInitiateDto.phoneNumber },
          select: {
            id: true,
            userAuth: { select: { id: true, isEmailVerified: true } },
          },
        });
        if (!user) {
          throw new UnauthorizedException({
            message: 'Invalid phone number or OTP',
          });
        }
        // Create and send SMS OTP.
        otp = await this.otpService.createOTP(user.userAuth.id, OTPType.PHONE);
        await this.otpService.sendSMSOTP(loginInitiateDto.phoneNumber, otp);
        loginMethod = 'phone';
      }

      return {
        status: 'success',
        message: `OTP sent to your ${loginMethod}`,
        userId: user.id,
        loginMethod,
      };
    } catch (error) {
      logger.error('Error during login', error.stack);

      throw new InternalServerErrorException({
        status: 'error',
        message: 'An error occurred during login. Please try again.',
      });
    }
  }

  async verifyLoginOTP(verifyDto: otp.VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: verifyDto.userId },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        role: true,
        userAuth: {
          select: {
            id: true,
            isEmailVerified: true,
            isPhoneVerified: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Try both OTP types since we don't know which one was used
    const isEmailValid = await this.otpService
      .verifyOTP(user.userAuth.id, verifyDto.otp, OTPType.EMAIL)
      .catch(() => false);

    const isPhoneValid = await this.otpService
      .verifyOTP(user.userAuth.id, verifyDto.otp, OTPType.PHONE)
      .catch(() => false);

    if (!isEmailValid && !isPhoneValid) {
      throw new UnauthorizedException('Invalid OTP');
    }
    // Update user verification status based on OTP type
    await this.prisma.userAuth.update({
      where: { id: user.userAuth.id },
      data: {
        isEmailVerified: isEmailValid ? true : undefined,
        isPhoneVerified: isPhoneValid ? true : undefined,
      },
    });

    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userAuth: true,
      },
    });

    return this.generateTokens(fullUser);
  }

  async loginWithGoogle(googleUser: any) {
    // Try finding an existing user using the email
    let existingUser = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    // If user doesn't exist, create a new record
    if (!existingUser) {
      existingUser = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          name: `${googleUser.firstName}`,
          role: Role.RENTER,
          // Populate other fields if needed.
          userAuth: {
            create: {
              provider: googleUser.provider,
              providerId: googleUser.providerId,
              password: null, // No password for OAuth
            },
          },
        },
      });
    }

    const fullUser = await this.prisma.user.findUnique({
      where: { id: existingUser.id },
      include: {
        userAuth: true,
      },
    });

    const tokens = await this.generateTokens(fullUser);
    return tokens;
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Find the refresh token in the database first
      const existingToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: {
          UserAuth: {
            include: {
              user: {
                include: {
                  userAuth: true,
                },
              },
            },
          },
        },
      });
      const user = existingToken.UserAuth.user;
      if (!existingToken || existingToken.expires < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      if (!existingToken.UserAuth) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Delete the used refresh token
      await this.prisma.refreshToken.delete({
        where: { id: existingToken.id },
      });

      // Create new refresh token
      await this.prisma.refreshToken.create({
        data: {
          token: crypto.randomUUID(), // Generate a new UUID for refresh token
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          userAuthId: existingToken.UserAuth.id,
        },
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async sendPasswordResetEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { userAuth: true },
      });

      if (!user) {
        return;
      }

      const resetToken = randomBytes(32).toString('hex');
      const tokenHash = await bcrypt.hash(resetToken, 10);

      await this.prisma.userAuth.update({
        where: { id: user.userAuth.id }, // Use the primary key
        data: {
          resetToken: tokenHash,
          tokenCreatedAt: new Date(),
        },
      });

      const user2 = await this.prisma.userAuth.findUnique({
        where: {
          id: user.userAuth.id,
        },
      });

      // Send email with reset link
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await this.mailerService.sendPasswordResetEmail(user.email, resetLink);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error sending password reset email',
      );
    }
  }

  async resetPassword(
    userId: string,
    token: string,
    newPassword: string,
  ): Promise<void> {
    const isValidToken = await this.verifyResetToken(userId, token);

    if (!isValidToken) {
      throw new UnauthorizedException(
        'Invalid or expired password reset token',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.userAuth.update({
      where: { userId },
      data: {
        password: hashedPassword,
        resetToken: null,
        tokenCreatedAt: null,
      },
    });
  }

  async verifyResetToken(userId: string, token: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { userAuth: true },
      });
      console.log('🚀 ~ AuthService ~ verifyResetToken ~ user:', user);

      if (!user || !user.userAuth.resetToken || !user.userAuth.tokenCreatedAt) {
        return false;
      }

      // Check if token is expired (24 hours)
      const tokenAge =
        (new Date().getTime() - user.userAuth.tokenCreatedAt.getTime()) /
        (1000 * 60 * 60);
      if (tokenAge > 24) {
        return false;
      }

      // Verify the token
      const isValidToken = await bcrypt.compare(
        token,
        user.userAuth.resetToken,
      );
      console.log(
        '🚀 ~ AuthService ~ verifyResetToken ~ isValidToken:',
        isValidToken,
      );
      return isValidToken;
    } catch (error) {
      return false;
    }
  }

  private async generateTokens(user: {
    email: string;
    role: $Enums.Role;
    id: string;
    userAuth: {
      isEmailVerified: boolean;
      isPhoneVerified: boolean;
      password: string;
      id: string;
    };
    phoneNumber: string;
    aadharNumber: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
          isEmailVerified: user.userAuth?.isEmailVerified,
          isPhoneVerified: user.userAuth?.isPhoneVerified,
        },
        { expiresIn: '365d' },
      ),
      this.generateRefreshToken(user.userAuth.id),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    };
  }
  private async generateRefreshToken(userAuthId: string): Promise<string> {
    const token = uuidv4();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token,
        expires,
        userAuthId,
      },
    });

    return token;
  }
}
