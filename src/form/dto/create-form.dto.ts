import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  IsArray,
  ArrayMaxSize,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  PropertyType,
  Furnishing,
  PreferredTenant,
  Amenities,
  Features,
  SharingType,
  Configuration,
  LockInPeriod,
} from '@prisma/client';
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

  @ApiProperty({ example: 'FLAT_APARTMENT', enum: PropertyType })
  @IsEnum(PropertyType)
  @IsNotEmpty()
  propertyType: PropertyType;

  @ApiProperty()
  @IsNotEmpty()
  location: LocationDto;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0)
  security: number;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  brokerage: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isNegotiable?: boolean;

  @ApiProperty({ enum: LockInPeriod })
  @IsEnum(LockInPeriod)
  @IsOptional()
  lockInPeriod?: LockInPeriod;

  @ApiProperty()
  @IsString()
  @IsOptional()
  availableFrom?: string;

  // Builder Floor, Flat/Apartment, Villa specific
  @ApiProperty({ enum: Configuration })
  @IsEnum(Configuration)
  @IsOptional()
  configuration?: Configuration;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  bedrooms?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  bathrooms?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  balconies?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  floorNumber?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  totalFloors?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  maintenanceCharges?: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isMaintenanceIncluded?: boolean;

  // Co-living/PG specific
  @ApiProperty()
  @IsString()
  @IsOptional()
  roomType?: string;

  @ApiProperty({ enum: SharingType })
  @IsEnum(SharingType)
  @IsOptional()
  sharingType?: SharingType;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  unitsAvailable?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  roomSize?: number;

  // Furnishing details
  @ApiProperty({ enum: Furnishing })
  @IsEnum(Furnishing)
  @IsOptional()
  furnishing?: Furnishing;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  furnishingExtras?: string[];

  // Features and Amenities
  @ApiProperty({ enum: Amenities, isArray: true })
  @IsArray()
  @IsEnum(Amenities, { each: true })
  @IsOptional()
  amenities?: Amenities[];

  @ApiProperty({ enum: Features, isArray: true })
  @IsArray()
  @IsEnum(Features, { each: true })
  @IsOptional()
  features?: Features[];

  @ApiProperty({ enum: PreferredTenant })
  @IsEnum(PreferredTenant)
  @IsOptional()
  preferredTenant?: PreferredTenant;

  // Images
  @ApiProperty()
  @IsString()
  @IsOptional()
  mainImage?: string;

  @ApiProperty({ type: [String], description: 'Array of photo URLs (max 10)' })
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @IsNotEmpty()
  photos: string[];

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isPreoccupied?: boolean;
}
