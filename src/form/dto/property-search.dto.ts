import {
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PropertyType } from '@prisma/client';

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
}
