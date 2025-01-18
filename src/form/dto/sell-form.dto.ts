import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class SellDetailsDto {
  @ApiProperty({ example: 20000, description: 'Asking price for the property' })
  @IsNumber()
  @IsNotEmpty()
  askingPrice: number;
}
