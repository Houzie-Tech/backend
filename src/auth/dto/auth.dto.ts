import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsPhoneNumber,
  IsString,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class RegisterAuthDto {
  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mobile phone number', example: '+919876543210' })
  @IsMobilePhone('en-IN')
  phoneNumber: string;

  @ApiProperty({
    description: 'Aadhar number of the user',
    example: '123456781234',
  })
  @IsString()
  aadharNumber: string;

  @ApiProperty({
    enum: Role,
    enumName: 'Role',
    description: 'Role of the user',
  })
  @IsEnum(Role)
  role: Role;
}

export class LoginInitiateDto {
  @ApiProperty({
    description: 'Email address for login',
    example: 'john.doe@example.com',
    required: false,
  })
  @ValidateIf((o) => !o.phoneNumber)
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Phone number for login',
    example: '+919876543210',
    required: false,
  })
  @ValidateIf((o) => !o.email)
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;
}

export class RefreshDto {
  @ApiProperty({
    description: 'Refresh token for session renewal',
    example: 'eyJhbGciOi...',
  })
  @IsString()
  refreshToken: string;
}

export class UpdateAuthDto extends PartialType(RegisterAuthDto) {}

export class InitiatePasswordResetDto {
  @ApiProperty({
    description: 'Email address to initiate password reset',
    example: 'john.doe@example.com',
  })
  @IsString()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '12345',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'One-time password for verification',
    example: '123456',
  })
  @IsString()
  otp: string;

  @ApiProperty({
    description: 'New password for the user',
    example: 'StrongP@ssw0rd!',
  })
  @IsString()
  newPassword: string;
}
