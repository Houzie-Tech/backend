/* eslint-disable no-unused-vars */
import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OTPType } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import { ERROR_MESSAGES } from 'src/constant/otp.constant';
import { PrismaService } from 'src/prisma/prisma.service';
import * as twilio from 'twilio';

@Injectable()
export class OTPService {
  private twilioClient: twilio.Twilio;
  private emailTransporter: nodemailer.Transporter;
  private readonly logger = new Logger(OTPService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    try {
      this.twilioClient = twilio(
        this.config.get('TWILIO_ACCOUNT_SID'),
        this.config.get('TWILIO_AUTH_TOKEN'),
      );
    } catch (error) {
      this.logger.error('Failed to initialize Twilio client', error.stack);
      throw new InternalServerErrorException(ERROR_MESSAGES.TWILIO_INIT_FAILED);
    }

    try {
      this.emailTransporter = nodemailer.createTransport({
        host: this.config.get('SMTP_HOST'),
        port: this.config.get('SMTP_PORT'),
        auth: {
          user: this.config.get('SMTP_USER'),
          pass: this.config.get('SMTP_PASS'),
        },
      });
    } catch (error) {
      this.logger.error('Failed to initialize email transporter', error.stack);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.EMAIL_TRANSPORTER_INIT_FAILED,
      );
    }
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createOTP(userId: string, type: OTPType): Promise<string> {
    try {
      const code = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await this.prisma.oTP.create({
        data: { code, type, expiresAt, userId },
      });

      return code;
    } catch (error) {
      this.logger.error(
        `Failed to create OTP for user: ${userId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        ERROR_MESSAGES.OTP_CREATION_FAILED,
      );
    }
  }

  async sendEmailOTP(email: string, code: string): Promise<void> {
    try {
      await this.emailTransporter.sendMail({
        from: this.config.get('SMTP_FROM'),
        to: email,
        subject: 'Your verification code',
        text: `Your OTP is: ${code}. It will expire in 10 minutes.`,
        html: `<p>Your OTP is: <strong>${code}</strong>. It will expire in 10 minutes.</p>`,
      });
    } catch (error) {
      this.logger.error(`Failed to send OTP email to: ${email}`, error.stack);
      throw new InternalServerErrorException(ERROR_MESSAGES.OTP_SENDING_FAILED);
    }
  }

  async sendSMSOTP(phoneNumber: string, code: string): Promise<void> {
    try {
      await this.twilioClient.messages.create({
        body: `Your verification code is: ${code}. It will expire in 10 minutes.`,
        from: this.config.get('TWILIO_PHONE_NUMBER'),
        to: phoneNumber,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send OTP SMS to: ${phoneNumber}`,
        error.stack,
      );

      if (error.code === 21614) {
        // Twilio error: Invalid phone number
        throw new BadRequestException('Invalid phone number provided');
      }

      throw new InternalServerErrorException(ERROR_MESSAGES.OTP_SENDING_FAILED);
    }
  }

  async verifyOTP(
    userId: string,
    code: string,
    type: OTPType,
  ): Promise<boolean> {
    try {
      const otp = await this.prisma.oTP.findFirst({
        where: {
          userId,
          code,
          type,
          isUsed: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!otp) {
        this.logger.warn(`OTP verification failed for user: ${userId}`);
        throw new BadRequestException(ERROR_MESSAGES.OTP_VERIFICATION_FAILED);
      }

      // Mark OTP as used
      await this.prisma.oTP.update({
        where: { id: otp.id },
        data: { isUsed: true },
      });

      // Update user verification status
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(type === OTPType.EMAIL && { isEmailVerified: true }),
          ...(type === OTPType.PHONE && { isPhoneVerified: true }),
        },
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to verify OTP for user: ${userId}, code: ${code}, type: ${type}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        ERROR_MESSAGES.OTP_VERIFICATION_FAILED,
      );
    }
  }
}
