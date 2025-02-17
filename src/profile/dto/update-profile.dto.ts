import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProfileDto } from './create-profile.dto';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  @ApiProperty({
    description: 'Name of the user',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Aadhar number (optional for OAuth users)',
    example: '123456781234',
    required: false,
  })
  @IsString({ message: 'Aadhar number must be a string.' })
  @IsOptional()
  aadharNumber?: string;
}
