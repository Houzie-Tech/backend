import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateLeadDto } from './create-lead.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @ApiProperty({ description: 'Whether the lead is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
