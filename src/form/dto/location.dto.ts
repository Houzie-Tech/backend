import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class LocationDto {
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
