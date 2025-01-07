import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsLatitude,
  IsLongitude,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

enum ListingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class UpdateFormDto {
  @ApiPropertyOptional({ example: 'Modern 2BHK Apartment' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: 'A beautiful apartment with modern amenities...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 25000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 'Mumbai' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: 'India' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: 19.076 })
  @IsNumber()
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 72.8777 })
  @IsNumber()
  @IsLongitude()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ enum: ListingStatus, example: 'APPROVED' })
  @IsEnum(ListingStatus)
  @IsOptional()
  status?: string;
}
