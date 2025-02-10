import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

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

export class InitiateOtpDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+919876543210',
    required: false,
  })
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber: string;
}
