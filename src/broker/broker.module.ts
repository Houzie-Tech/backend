import { Module } from '@nestjs/common';
import { BrokerService } from './broker.service';
import { BrokerController } from './broker.controller';

@Module({
  controllers: [BrokerController],
  providers: [BrokerService],
})
export class BrokerModule {}
