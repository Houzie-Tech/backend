import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { FormModule } from './form/form.module';
import { LeadsModule } from './leads/leads.module';
import { BrokerModule } from './broker/broker.module';
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
