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
  IsNotEmpty,
} from 'class-validator';

export class RegisterAuthDto {
  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  @IsString({ message: 'Name must be a string.' })
  @IsNotEmpty({ message: 'Name is required.' })
  name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @ApiProperty({
    description: 'Mobile phone number',
    example: '+919876543210',
  })
  @IsMobilePhone('en-IN', {}, { message: 'Invalid mobile phone number.' })
  @IsNotEmpty({ message: 'Phone number is required.' })
  phoneNumber: string;

  @ApiProperty({
    description: 'Aadhar number of the user',
    example: '123456781234',
  })
  @IsString({ message: 'Aadhar number must be a string.' })
  @IsNotEmpty({ message: 'Aadhar number is required.' })
  aadharNumber: string;

  @ApiProperty({
    enum: Role,
    enumName: 'Role',
    description: 'Role of the user',
  })
  @IsEnum(Role, { message: 'Invalid role value.' })
  @IsNotEmpty({ message: 'Role is required.' })
  role: Role;
}

export class LoginInitiateDto {
  @ApiProperty({
    description: 'Email address for login',
    example: 'john.doe@example.com',
    required: false,
  })
  @ValidateIf((o) => !o.phoneNumber)
  @IsEmail({}, { message: 'Invalid email format.' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Phone number for login',
    example: '+919876543210',
    required: false,
  })
  @ValidateIf((o) => !o.email)
  @IsPhoneNumber(null, { message: 'Invalid phone number format.' })
  @IsOptional()
  phoneNumber?: string;
}

export class RefreshDto {
  @ApiProperty({
    description: 'Refresh token for session renewal',
    example: 'eyJhbGciOi...',
  })
  @IsString({ message: 'Refresh token must be a string.' })
  @IsNotEmpty({ message: 'Refresh token is required.' })
  refreshToken: string;
}

export class UpdateAuthDto extends PartialType(RegisterAuthDto) {}

export class InitiatePasswordResetDto {
  @ApiProperty({
    description: 'Email address to initiate password reset',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '12345',
  })
  @IsString({ message: 'User ID must be a string.' })
  @IsNotEmpty({ message: 'User ID is required.' })
  userId: string;

  @ApiProperty({
    description: 'One-time password for verification',
    example: '123456',
  })
  @IsString({ message: 'OTP must be a string.' })
  @IsNotEmpty({ message: 'OTP is required.' })
  otp: string;

  @ApiProperty({
    description: 'New password for the user',
    example: 'StrongP@ssw0rd!',
  })
  @IsString({ message: 'New password must be a string.' })
  @IsNotEmpty({ message: 'New password is required.' })
  newPassword: string;
}
