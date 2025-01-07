import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class OtpDto {
  @ApiProperty()
  @IsString()
  userId: string;
}

export class SendEmailDto extends OtpDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
export class VerifyOtpDto extends OtpDto {
  @ApiProperty()
  @IsString()
  otp: string;
}
