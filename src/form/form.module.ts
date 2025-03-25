import { Module } from '@nestjs/common';
import { FormService } from './form.service';
import { FormController } from './form.controller';
import { MetroStationModule } from 'src/metro-station/metro-station.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ListingCreator } from './services/listing-creator.service';
import { ListingMetroService } from './services/listing-metro.service';

@Module({
  imports: [PrismaModule, MetroStationModule],
  controllers: [FormController],
  providers: [ListingCreator, ListingMetroService, FormService],
})
export class FormModule {}
