import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OTPService } from '../otp/otp.service';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './strategy/google.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from 'src/mail/mail.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    ConfigModule,
    PassportModule,
    MailerModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, OTPService, GoogleStrategy],
})
export class AuthModule {}
