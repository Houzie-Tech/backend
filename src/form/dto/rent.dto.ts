import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsNumber } from 'class-validator';

export class RentDetails {
  @ApiProperty({
    example: '1',
    description: 'ID of the property',
  })
  propertyId: string;

  @ApiProperty({
    example: '2025-01-01T00:00:00Z',
    description: 'Date the property is available from',
  })
  @IsISO8601()
  @IsNotEmpty()
  availableFrom: string;

  @ApiProperty({ example: 50000, description: 'Security deposit amount' })
  @IsNumber()
  @IsNotEmpty()
  deposit: number;

  @ApiProperty({ example: 20000, description: 'Monthly rent amount' })
  @IsNumber()
  @IsNotEmpty()
  rentAmount: number;
}

export class RentDetailsUpdate {
  @ApiProperty({
    example: '2025-01-01T00:00:00Z',
    description: 'Date the property is available from',
  })
  @IsISO8601()
  @IsNotEmpty()
  availableFrom: string;

  @ApiProperty({ example: 50000, description: 'Security deposit amount' })
  @IsNumber()
  @IsNotEmpty()
  deposit: number;

  @ApiProperty({ example: 20000, description: 'Monthly rent amount' })
  @IsNumber()
  @IsNotEmpty()
  rentAmount: number;
}
