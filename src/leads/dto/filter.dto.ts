import { LeadStatus, Priority } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class FilterLeadsByListingDto {
  @IsString()
  listingId: string;

  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;
}
