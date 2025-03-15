import {
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  Min,
  Max,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  PreferredTenant,
  PropertyType,
  Gender,
  Furnishing,
  Amenities,
  Features,
  Configuration,
  ListingStatus,
} from '@prisma/client';

export class PropertySearchDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minBedrooms?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxBedrooms?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minBathrooms?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxBathrooms?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(PropertyType, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    if (Array.isArray(value)) {
      return value;
    }
    return [value];
  })
  propertyType?: PropertyType[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  distanceInKm?: number = 10;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(PreferredTenant)
  preferredTenant?: PreferredTenant;

  @IsOptional()
  @IsArray()
  @IsEnum(Gender, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    if (Array.isArray(value)) {
      return value;
    }
    return [value];
  })
  preferredGender?: Gender[];

  @IsOptional()
  @IsEnum(Furnishing)
  furnishing?: Furnishing;

  @IsOptional()
  @IsArray()
  @IsEnum(Amenities, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    if (Array.isArray(value)) {
      return value;
    }
    return [value];
  })
  amenities?: Amenities[];

  @IsOptional()
  @IsArray()
  @IsEnum(Features, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    if (Array.isArray(value)) {
      return value;
    }
    return [value];
  })
  features?: Features[];

  @IsOptional()
  @IsEnum(Configuration)
  configuration?: Configuration;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean = true;

  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus = 'ACTIVE';

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (value?.toLowerCase() === 'asc') return 'asc';
    return 'desc';
  })
  sortOrder?: 'asc' | 'desc' = 'desc';
}
