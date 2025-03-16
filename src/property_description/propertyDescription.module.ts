import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserPreference } from 'src/user_preference/userPrefernceCalculator.module';
import { DescriptionGeneratorService } from './propertyDescription.service';
import { DescriptionController } from './propertyDescription.controller';

@Module({
  imports: [PrismaModule, UserPreference],
  providers: [DescriptionGeneratorService],
  controllers: [DescriptionController],
  exports: [DescriptionGeneratorService],
})
export class PropertyDescription {}
