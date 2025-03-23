import { Module } from '@nestjs/common';
import { FormService } from './form.service';
import { FormController } from './form.controller';
import { MetroStationModule } from 'src/metro-station/metro-station.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, MetroStationModule],
  controllers: [FormController],
  providers: [FormService],
})
export class FormModule {}
