import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  IsArray,
  ArrayMaxSize,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PropertyType, Furnishing, RentFor } from '@prisma/client';
import { RentDetailsUpdate } from './rent.dto';
import { SellDetailsDto } from './sell-form.dto';
import { LocationDto } from './location.dto';

export class CreateFormDto {
  @ApiProperty({ example: 'Modern 2BHK Apartment' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A beautiful apartment with modern amenities...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      latitude: 19.076,
      longitude: 72.8777,
    },
  })
  @IsNotEmpty()
  location: LocationDto;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'FLAT_APARTMENT', enum: PropertyType })
  @IsEnum(PropertyType)
  @IsNotEmpty()
  propertyType: PropertyType;

  @ApiProperty({ example: '2BHK' })
  @IsString()
  @IsNotEmpty()
  configuration: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0)
  bedrooms: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0)
  bathrooms: number;

  @ApiProperty({ example: 'FULLY_FURNISHED', enum: Furnishing })
  @IsEnum(Furnishing)
  @IsNotEmpty()
  furnishing: Furnishing;

  @ApiProperty({
    example: ['BACHELOR', 'FAMILY'],
    enum: RentFor,
    isArray: true,
  })
  @IsArray()
  @IsEnum(RentFor, { each: true })
  @IsNotEmpty()
  rentFor: RentFor[];

  @ApiProperty({
    example: [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
    ],
    type: [String],
    description: 'Array of photo URLs (max 10)',
  })
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @IsNotEmpty()
  photos: string[];

  @ApiProperty({
    example: { availableFrom: 'datetime', deposit: 50000, rentAmount: 20000 },
    description: 'Details specific to rental properties (optional)',
  })
  @IsOptional()
  rentDetails?: RentDetailsUpdate;

  @ApiProperty({
    example: { askingPrice: 20000 },
    description: 'Details specific to sale properties (optional)',
  })
  @IsOptional()
  sellDetails?: SellDetailsDto;
}
