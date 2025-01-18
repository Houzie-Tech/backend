import { ApiProperty } from '@nestjs/swagger';
import { PropertyType } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsNumber,
  IsArray,
  IsEnum,
} from 'class-validator';

export class CreateLeadDto {
  @ApiProperty({ description: 'Name of the lead' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email address of the lead', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Phone number of the lead' })
  @IsPhoneNumber('IN')
  phoneNumber: string;

  @ApiProperty({ description: 'Minimum budget of the lead' })
  @IsNumber()
  budgetMin: number;

  @ApiProperty({ description: 'Maximum budget of the lead' })
  @IsNumber()
  budgetMax: number;

  @ApiProperty({
    description: 'Preferred locations of the lead',
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  preferredLocations: string[];

  @ApiProperty({
    description: 'Property types the lead is interested in',
    enum: PropertyType,
    isArray: true,
  })
  @IsArray()
  @IsEnum(PropertyType, { each: true })
  propertyTypes: PropertyType[];
}
