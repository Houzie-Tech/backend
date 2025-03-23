import { Module } from '@nestjs/common';
import { MetroStationService } from './metro-station.service';
import { MetroStationController } from './metro-station.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MetroStationController],
  providers: [MetroStationService],
  exports: [MetroStationService],
})
export class MetroStationModule {}
