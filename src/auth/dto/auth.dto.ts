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
    description: 'Password (required for normal login, optional for OAuth)',
    example: 'StrongP@ssw0rd!',
    required: false,
  })
  @ValidateIf((o) => !o.provider)
  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required for normal registration.' })
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'Mobile phone number (optional for OAuth users)',
    example: '+919876543210',
    required: false,
  })
  @IsMobilePhone('en-IN', {}, { message: 'Invalid mobile phone number.' })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Aadhar number (optional for OAuth users)',
    example: '123456781234',
    required: false,
  })
  @IsString({ message: 'Aadhar number must be a string.' })
  @IsOptional()
  aadharNumber?: string;

  @IsString({ message: 'company must be a string.' })
  @IsOptional()
  companyName?: string;

  @ApiProperty({
    enum: Role,
    enumName: 'Role',
    description: 'Role of the user',
  })
  @IsEnum(Role, { message: 'Invalid role value.' })
  @IsNotEmpty({ message: 'Role is required.' })
  role: Role;

  @ApiProperty({
    description: 'OAuth provider (Google, GitHub, etc.)',
    example: 'google',
    required: false,
  })
  @IsString({ message: 'Provider must be a string.' })
  @IsOptional()
  provider?: string;

  @ApiProperty({
    description: 'OAuth provider ID (only for OAuth users)',
    example: '11223344556677889900',
    required: false,
  })
  @IsString({ message: 'Provider ID must be a string.' })
  @IsOptional()
  providerId?: string;
}

export class LoginInitiateDto {
  @ApiProperty({
    description: 'Email address for login',
    example: 'john.doe@example.com',
    required: false,
  })
  @ValidateIf((o) => !o.phoneNumber && !o.provider)
  @IsEmail({}, { message: 'Invalid email format.' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Phone number for login',
    example: '+919876543210',
    required: false,
  })
  @ValidateIf((o) => !o.email && !o.provider)
  @IsPhoneNumber(null, { message: 'Invalid phone number format.' })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Password (required for normal login, not required for OAuth)',
    example: 'StrongP@ssw0rd!',
    required: false,
  })
  @ValidateIf((o) => !o.provider)
  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required for normal login.' })
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'OAuth provider (Google, GitHub, etc.)',
    example: 'google',
    required: false,
  })
  @ValidateIf((o) => !o.email && !o.phoneNumber)
  @IsString({ message: 'Provider must be a string.' })
  @IsOptional()
  provider?: string;

  @ApiProperty({
    description: 'OAuth provider ID (only for OAuth users)',
    example: '11223344556677889900',
    required: false,
  })
  @ValidateIf((o) => o.provider)
  @IsString({ message: 'Provider ID must be a string.' })
  @IsOptional()
  providerId?: string;
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
