import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { FormModule } from './form/form.module';
import { LeadsModule } from './leads/leads.module';
import { BrokerModule } from './broker/broker.module';
import { ProfileModule } from './profile/profile.module';
import { AdminModule } from './admin/admin.module';
import { ReportsModule } from './reports/reports.module';
import { UserPreference } from './user_preference/userPrefernceCalculator.module';
import { PropertyDescription } from './property_description/propertyDescription.module';
import { MetroStationModule } from './metro-station/metro-station.module';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    FormModule,
    BrokerModule,
    LeadsModule,
    ProfileModule,
    AdminModule,
    ReportsModule,
    UserPreference,
    PropertyDescription,
    MetroStationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
