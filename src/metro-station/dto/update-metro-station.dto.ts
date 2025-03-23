import { CreateMetroStationDto } from './create-metro-station.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateMetroStationDto extends PartialType(CreateMetroStationDto) {}
