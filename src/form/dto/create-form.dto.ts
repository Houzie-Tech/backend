import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFormDto {
  @ApiProperty({ example: 'Modern 2BHK Apartment' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A beautiful apartment with modern amenities...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: 'India' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 19.076 })
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @ApiProperty({ example: 72.8777 })
  @IsNumber()
  @IsLongitude()
  longitude: number;
}
