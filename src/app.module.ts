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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
