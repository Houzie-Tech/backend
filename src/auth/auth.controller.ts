import {
  Controller,
  Post,
  Body,
  Logger,
  Get,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { OTPService } from '../otp/otp.service';
import { otp, auth } from './dto';
import { AuthGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OTPService,
  ) {}
  @Post('register')
  async register(@Body() registerDto: auth.RegisterAuthDto) {
    try {
      const user = await this.authService.register(registerDto);
      return {
        message: 'Registration successful. Please verify your email and phone.',
        user,
      };
    } catch (error) {
      // Handle specific error cases
      if (error.code === 'P2002') {
        // Prisma unique constraint violation
        throw new BadRequestException(
          `A user with this ${error.meta.target} already exists.`,
        );
      }
      throw new BadRequestException(
        'An error occurred during registration. Please try again.',
      );
    }
  }

  @Post('login/initiate')
  async initiateLogin(@Body() loginDto: auth.LoginInitiateDto) {
    try {
      return await this.authService.initiateLogin(loginDto);
    } catch (error) {
      this.logger.error('Failed to initiate login', error.stack);
      throw error;
    }
  }

  @Post('login/verify')
  async verifyLogin(@Body() verifyDto: otp.VerifyOtpDto) {
    try {
      const result = await this.authService.verifyLoginOTP(verifyDto);
      return {
        status: 'success',
        message: 'Login successful',
        ...result,
      };
    } catch (error) {
      this.logger.error('Failed to verify login', error.stack);
      throw error;
    }
  }

  @Post('refresh')
  async refresh(@Body() body: auth.RefreshDto) {
    return this.authService.refreshTokens(body.refreshToken);
  }

  @Post('password-reset/initiate')
  async initiatePasswordReset(@Body() body: auth.InitiatePasswordResetDto) {
    return this.authService.initiatePasswordReset(body.email);
  }

  @UseGuards(AuthGuard)
  @Get('ADMIN')
  adminRoute() {
    return { message: 'Admin access granted' };
  }
}
