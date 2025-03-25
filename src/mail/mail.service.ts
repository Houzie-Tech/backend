import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private emailTransporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailerService.name);

  constructor(private config: ConfigService) {
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
        'Email transporter initialization failed',
      );
    }
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }): Promise<void> {
    try {
      await this.emailTransporter.sendMail({
        from: this.config.get('SMTP_FROM'),
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      this.logger.log(`Email sent successfully to: ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to: ${options.to}`, error.stack);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendOTPEmail(email: string, code: string): Promise<void> {
    return this.sendEmail({
      to: email,
      subject: 'Your verification code',
      text: `Your OTP is: ${code}. It will expire in 10 minutes.`,
      html: `<p>Your OTP is: <strong>${code}</strong>. It will expire in 10 minutes.</p>`,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    resetLink: string,
  ): Promise<void> {
    return this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      text: `Please use the following link to reset your password: ${resetLink}. This link will expire in 24 hours.`,
      html: `
        <p>Hello,</p>
        <p>You requested to reset your password.</p>
        <p>Please click the link below to reset your password:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
  }
}
