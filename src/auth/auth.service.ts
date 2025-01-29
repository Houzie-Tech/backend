/* eslint-disable no-unused-vars */
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OTPService } from '../otp/otp.service';
import { JwtService } from '@nestjs/jwt';
import { OTPType, User } from '@prisma/client';
import { otp, auth } from './dto';
import { v4 as uuidv4 } from 'uuid';

//TODO implement timeout for email and otp

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OTPService,
  ) {}

  async register(registerDto: auth.RegisterAuthDto) {
    try {
      // Create the user
      const user = await this.prisma.user.create({
        data: {
          ...registerDto,
        },
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          role: true,
        },
      });

      // Send verification OTPs
      await this.otpService.createOTP(user.id, OTPType.EMAIL);
      await this.otpService.createOTP(user.id, OTPType.PHONE);

      return user;
    } catch (error) {
      // Prisma-specific error handling
      if (error.code === 'P2002') {
        // Unique constraint violation (e.g., email or phone already exists)
        throw new Error(
          `A user with this ${error.meta.target} already exists.`,
        );
      }

      // Log the error (optional, for debugging)
      console.error('Error during registration:', error);

      // Rethrow a generic error for unexpected cases
      throw new Error(
        'An error occurred during user registration. Please try again.',
      );
    }
  }

  async initiateLogin(loginDto: auth.LoginInitiateDto) {
    // Validate that either email or phone is provided, but not both
    if (
      (!loginDto.email && !loginDto.phoneNumber) ||
      (loginDto.email && loginDto.phoneNumber)
    ) {
      throw new BadRequestException('Provide either email or phone number');
    }

    let user: User;
    if (loginDto.email) {
      user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });
    } else {
      user = await this.prisma.user.findUnique({
        where: { phoneNumber: loginDto.phoneNumber },
      });
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate OTP based on login method
    const otpType = loginDto.email ? OTPType.EMAIL : OTPType.PHONE;
    const otp = await this.otpService.createOTP(user.id, otpType);

    // Send OTP based on login method
    if (loginDto.email) {
      await this.otpService.sendEmailOTP(user.email, otp);
    } else {
      await this.otpService.sendSMSOTP(user.phoneNumber, otp);
    }

    return {
      message: `OTP sent to your ${loginDto.email ? 'email' : 'phone'}`,
      userId: user.id,
      loginMethod: loginDto.email ? 'email' : 'phone',
    };
  }

  async verifyLoginOTP(verifyDto: otp.VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: verifyDto.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Try both OTP types since we don't know which one was used
    const isEmailValid = await this.otpService
      .verifyOTP(verifyDto.userId, verifyDto.otp, OTPType.EMAIL)
      .catch(() => false);

    const isPhoneValid = await this.otpService
      .verifyOTP(verifyDto.userId, verifyDto.otp, OTPType.PHONE)
      .catch(() => false);

    if (!isEmailValid && !isPhoneValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Generate tokens after successful verification
    return this.generateTokens(user);
  }

  // Todo Change the data type from any
  async refreshTokens(refreshToken: string): Promise<any> {
    const token = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!token || token.expires < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Delete the used refresh token
    await this.prisma.refreshToken.delete({ where: { id: token.id } });

    // Generate new tokens
    return this.generateTokens(token.user);
  }

  private async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
        },
        { expiresIn: '15m' },
      ),
      this.generateRefreshToken(user.id),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    };
  }
  private async generateRefreshToken(userId: string): Promise<string> {
    const token = uuidv4();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token,
        expires,
        userId,
      },
    });

    return token;
  }

  async initiatePasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Send OTP for password reset
    const otp = await this.otpService.createOTP(user.id, OTPType.EMAIL);
    await this.otpService.sendEmailOTP(email, otp);

    return { message: 'Password reset OTP sent', userId: user.id };
  }

  async resetPassword() {
    // const isValid = await this.otpService.verifyOTP(userId, otp, OTPType.EMAIL);
    // if (!isValid) {
    //   throw new UnauthorizedException('Invalid OTP');
    // }

    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    // await this.prisma.user.update({
    //   where: { id: userId },
    //   data: { password: hashedPassword },
    // });

    // // Invalidate all refresh tokens
    // await this.prisma.refreshToken.deleteMany({ where: { userId } });

    return { message: 'Password reset successful' };
  }
}
