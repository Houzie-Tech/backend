import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus } from '@prisma/client';

export class CreateReportDto {
  @ApiProperty({
    description: 'Reason for reporting the listing',
    example: 'Fraudulent listing',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional details about the report',
    example: 'The property does not exist at the specified location',
  })
  @IsString()
  @IsOptional()
  details?: string;

  @ApiProperty({
    description: 'ID of the listing being reported',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  listingId: string;

  @ApiPropertyOptional({
    description: 'Status of the report',
    enum: ReportStatus,
    default: 'PENDING',
    example: 'PENDING',
  })
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;
}
