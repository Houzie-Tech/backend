import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BrokerService } from './broker.service';
import { AuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('broker')
export class BrokerController {
  constructor(private readonly brokerService: BrokerService) {}

  @Get()
  findAll() {
    return this.brokerService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brokerService.findOne(id);
  }
}
