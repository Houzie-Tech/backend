import { Global, Module } from '@nestjs/common';
import { PreferenceCalculatorService } from './preferenceCalculator.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [PreferenceCalculatorService],
  exports: [PreferenceCalculatorService],
})
export class UserPreference {}
