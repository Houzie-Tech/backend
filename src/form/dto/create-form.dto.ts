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
  ValidateIf,
  ValidateNested,
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
  Gender,
  RoomFurnishingItem,
  HouseFurnishingItem,
} from '@prisma/client';
import { LocationDto } from './location.dto';
import { Type } from 'class-transformer';

export class OccupantDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 28 })
  @IsNumber()
  @Min(0)
  age: number;

  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  @IsNotEmpty()
  profession: string;

  @ApiProperty({
    example: 'Quiet person who works from home most days',
    required: false,
  })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiProperty({
    enum: Gender,
    example: 'MALE',
    description: 'Gender of the occupant',
  })
  @IsEnum(Gender)
  @IsOptional()
  gender: Gender;
}

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

  @ApiProperty({
    enum: Gender,
    isArray: true,
    example: ['MALE', 'FEMALE'],
    description: 'Preferred genders for tenants',
  })
  @IsArray()
  @IsEnum(Gender, { each: true })
  @IsOptional()
  preferredGender?: Gender[];

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

  @ApiProperty({
    type: [OccupantDto],
    description: 'Details of current occupants if property is pre-occupied',
    required: false,
  })
  @ValidateIf((o) => o.isPreoccupied === true)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OccupantDto)
  @IsOptional()
  occupants?: OccupantDto[];

  // New pre-occupied flow fields

  @ApiProperty({
    enum: RoomFurnishingItem,
    isArray: true,
    example: ['AC', 'BED', 'WARDROBE'],
    description: 'Room furnishing items available',
    required: false,
  })
  @ValidateIf(
    (o) =>
      o.isPreoccupied === true &&
      ['VILLA', 'BUILDER_FLOOR', 'FLAT_APARTMENT'].includes(o.propertyType),
  )
  @IsArray()
  @IsEnum(RoomFurnishingItem, { each: true })
  @IsOptional()
  roomFurnishingItems?: RoomFurnishingItem[];

  @ApiProperty({
    enum: HouseFurnishingItem,
    isArray: true,
    example: ['TV', 'FRIDGE', 'SOFA'],
    description: 'House furnishing items available',
    required: false,
  })
  @ValidateIf(
    (o) =>
      o.isPreoccupied === true &&
      ['VILLA', 'BUILDER_FLOOR', 'FLAT_APARTMENT'].includes(o.propertyType),
  )
  @IsArray()
  @IsEnum(HouseFurnishingItem, { each: true })
  @IsOptional()
  houseFurnishingItems?: HouseFurnishingItem[];

  @ApiProperty({
    example: 1500,
    description: 'Maid charges per person (cleaning + utensils)',
    required: false,
  })
  @ValidateIf(
    (o) =>
      o.isPreoccupied === true &&
      ['VILLA', 'BUILDER_FLOOR', 'FLAT_APARTMENT'].includes(o.propertyType),
  )
  @IsNumber()
  @Min(0)
  @IsOptional()
  maidChargesPerPerson?: number;

  @ApiProperty({
    example: 2000,
    description: 'Cook charges per person',
    required: false,
  })
  @ValidateIf(
    (o) =>
      o.isPreoccupied === true &&
      ['VILLA', 'BUILDER_FLOOR', 'FLAT_APARTMENT'].includes(o.propertyType),
  )
  @IsNumber()
  @Min(0)
  @IsOptional()
  cookChargesPerPerson?: number;

  @ApiProperty({
    example: 500,
    description: 'WiFi charges per person',
    required: false,
  })
  @ValidateIf(
    (o) =>
      o.isPreoccupied === true &&
      ['VILLA', 'BUILDER_FLOOR', 'FLAT_APARTMENT'].includes(o.propertyType),
  )
  @IsNumber()
  @Min(0)
  @IsOptional()
  wifiChargesPerPerson?: number;

  @ApiProperty({
    example: 300,
    description: 'Any other maintenance charges per person',
    required: false,
  })
  @ValidateIf(
    (o) =>
      o.isPreoccupied === true &&
      ['VILLA', 'BUILDER_FLOOR', 'FLAT_APARTMENT'].includes(o.propertyType),
  )
  @IsNumber()
  @Min(0)
  @IsOptional()
  otherMaintenanceCharges?: number;

  @ApiProperty({
    example: 'Electricity and water bill charges',
    description: 'Details about other maintenance charges',
    required: false,
  })
  @ValidateIf(
    (o) =>
      o.isPreoccupied === true &&
      o.otherMaintenanceCharges > 0 &&
      ['VILLA', 'BUILDER_FLOOR', 'FLAT_APARTMENT'].includes(o.propertyType),
  )
  @IsString()
  @IsOptional()
  otherMaintenanceDetails?: string;
}
