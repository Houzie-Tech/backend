import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BrokerService } from './broker.service';
import { AuthGuard } from 'src/auth/guards/jwt.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('broker')
export class BrokerController {
  constructor(private readonly brokerService: BrokerService) {}

  @Get()
  findAll() {
    return this.brokerService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get('stats')
  getActiveListings(@GetUser('sub') brokerId: string) {
    return this.brokerService.getStats(brokerId);
  }

  @UseGuards(AuthGuard)
  @Get('leads')
  getActiveLeads(@GetUser('sub') brokerId: string) {
    return this.brokerService.getActiveLeads(brokerId);
  }

  @UseGuards(AuthGuard)
  @Get('listings')
  getListings(@GetUser('sub') brokerId: string) {
    return this.brokerService.getListingsFromBroker(brokerId);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brokerService.findOne(id);
  }
}
