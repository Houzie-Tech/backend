import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { FormModule } from './form/form.module';
import { BrokerModule } from './broker/broker.module';
import { LeadsModule } from './leads/leads.module';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes config accessible everywhere
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
