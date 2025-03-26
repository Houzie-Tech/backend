import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyResetTokenDto {
  @ApiProperty({
    description: 'The reset token',
    example: 'abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'The user ID',
    example: '5f9d7a3b-1c2d-3e4f-5g6h-7i8j9k0l1m2n',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'The reset token',
    example: 'abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'The user ID',
    example: '5f9d7a3b-1c2d-3e4f-5g6h-7i8j9k0l1m2n',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'The new password (minimum 8 characters)',
    example: 'newSecurePassword123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
