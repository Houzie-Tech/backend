import {
  Controller,
  Post,
  Body,
  Logger,
  UnauthorizedException,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { otp, auth } from './dto';
import { Request } from 'express';
import { LoginEmailDto } from './dto/email_pw.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ConfigService } from '@nestjs/config';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyResetTokenDto,
} from './dto/password-reset.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // Redirects to Google's sign-in page.
  }

  @Get('google-redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: Request & { user: any }) {
    try {
      const googleUser = req.user;
      const { accessToken, refreshToken, user } =
        await this.authService.loginWithGoogle(googleUser);

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');

      return {
        status: 'success',
        message: 'Google authentication successful',
        user,
        accessToken,
        refreshToken,
        redirectUrl: `${frontendUrl}/auth-success`,
      };
    } catch (error) {
      this.logger.error('Google authentication failed', error.stack);
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  @Post('register')
  async register(@Body() registerDto: auth.RegisterAuthDto) {
    try {
      const result = await this.authService.register(registerDto);
      return {
        status: 'success',
        message: 'Registration successful. Please verify your email and phone.',
        ...result,
      };
    } catch (error) {
      this.logger.error('Registration failed', error.stack);
      throw error;
    }
  }

  @Post('login/email/pw')
  async loginEmail(@Body() loginDto: LoginEmailDto) {
    try {
      return await this.authService.loginEmail(loginDto);
    } catch (error) {
      this.logger.warn(`Login failed for ${loginDto.email}`);
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  @Post('login/initiate')
  async loginEmailOtp(@Body() loginDto: otp.InitiateOtpDto) {
    try {
      return await this.authService.initiateOtp(loginDto);
    } catch (error) {
      this.logger.warn(`OTP initiation failed for ${loginDto.email}`);
      throw new UnauthorizedException('Invalid email or OTP');
    }
  }

  @Post('login/verify')
  async verifyLogin(@Body() verifyDto: otp.VerifyOtpDto) {
    try {
      return {
        status: 'success',
        message: 'Login successful',
        ...(await this.authService.verifyLoginOTP(verifyDto)),
      };
    } catch (error) {
      this.logger.error('OTP verification failed', error.stack);
      throw error;
    }
  }

  @Post('refresh')
  async refresh(@Body() refreshDto: auth.RefreshDto) {
    try {
      return await this.authService.refreshTokens(refreshDto.refreshToken);
    } catch (error) {
      this.logger.warn('Token refresh failed');
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      await this.authService.sendPasswordResetEmail(forgotPasswordDto.email);
      return {
        status: 'success',
        message: 'If the email exists, a password reset link has been sent.',
      };
    } catch (error) {
      this.logger.error('Password reset request failed', error.stack);
      throw error;
    }
  }

  @Post('verify-reset-token')
  async verifyResetToken(@Body() verifyDto: VerifyResetTokenDto) {
    try {
      const isValid = await this.authService.verifyResetToken(
        verifyDto.userId,
        verifyDto.token,
      );
      return {
        status: 'success',
        isValid,
      };
    } catch (error) {
      this.logger.error('Token verification failed', error.stack);
      throw error;
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      await this.authService.resetPassword(
        resetPasswordDto.userId,
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
      return {
        status: 'success',
        message: 'Password has been successfully reset.',
      };
    } catch (error) {
      this.logger.error('Password reset failed', error.stack);
      throw error;
    }
  }
}
