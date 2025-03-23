import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MetroStationService } from './metro-station.service';
import { CreateMetroStationDto } from './dto/create-metro-station.dto';
import { UpdateMetroStationDto } from './dto/update-metro-station.dto';

@Controller('metro-stations')
export class MetroStationController {
  constructor(private readonly metroStationService: MetroStationService) {}

  @Post()
  create(@Body() createMetroStationDto: CreateMetroStationDto) {
    return this.metroStationService.create(createMetroStationDto);
  }

  @Get()
  findAll() {
    return this.metroStationService.findAll();
  }

  @Get('nearby')
  findNearby(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('maxDistance') maxDistance?: string,
  ) {
    return this.metroStationService.findNearbyMetroStations(
      parseFloat(latitude),
      parseFloat(longitude),
      maxDistance ? parseFloat(maxDistance) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.metroStationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMetroStationDto: UpdateMetroStationDto,
  ) {
    return this.metroStationService.update(+id, updateMetroStationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.metroStationService.remove(+id);
  }
}
