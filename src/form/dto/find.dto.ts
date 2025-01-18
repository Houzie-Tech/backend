import {
  IsNumber,
  Min,
  IsArray,
  IsOptional,
  IsEnum,
  IsISO8601,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PropertyType, Furnishing, RentFor } from '@prisma/client';

export class ListingFilters {
  @ApiProperty({
    description: 'Minimum price for the listing',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({
    description: 'Maximum price for the listing',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ description: 'Minimum number of bedrooms', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minBedrooms?: number;

  @ApiProperty({ description: 'Maximum number of bedrooms', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxBedrooms?: number;

  @ApiProperty({ description: 'Minimum number of bathrooms', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minBathrooms?: number;

  @ApiProperty({ description: 'Maximum number of bathrooms', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxBathrooms?: number;

  @ApiProperty({
    description: 'Furnishing options',
    enum: Furnishing,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Furnishing, { each: true })
  furnishing?: Furnishing[];

  @ApiProperty({
    description: 'Property types',
    enum: PropertyType,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PropertyType, { each: true })
  propertyType?: PropertyType[];

  @ApiProperty({
    description: 'Target audience for rent',
    enum: RentFor,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(RentFor, { each: true })
  rentFor?: RentFor[];

  @ApiProperty({
    description: 'Latitude for location-based search',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({
    description: 'Longitude for location-based search',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ description: 'Search radius in kilometers', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceInKm?: number;

  @ApiProperty({ description: 'Minimum monthly rent', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minRentAmount?: number;

  @ApiProperty({ description: 'Maximum monthly rent', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxRentAmount?: number;

  @ApiProperty({
    description: 'Earliest available date for rental properties',
    required: false,
  })
  @IsOptional()
  @IsISO8601()
  availableFrom?: Date;

  @ApiProperty({
    description: 'Minimum asking price for sale properties',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAskingPrice?: number;

  @ApiProperty({
    description: 'Maximum asking price for sale properties',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAskingPrice?: number;

  @ApiProperty({
    description: 'Current page for pagination',
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
