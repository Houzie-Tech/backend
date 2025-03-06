import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
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

  @UseGuards(AuthGuard)
  @Patch('/true/:id')
  async toggleAiDescriptionTrue(@Param('id') id: string) {
    try {
      const result = await this.brokerService.toggleAiDescription(id, true);
      return { message: 'Successfully toggled AI description', data: result };
    } catch (error) {
      console.error('Error toggling AI description:', error);
      return { error: 'Failed to toggle AI description' };
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/false/:id')
  async toggleAiDescriptionFalse(@Param('id') id: string) {
    try {
      const result = await this.brokerService.toggleAiDescription(id, false);
      return { message: 'Successfully toggled AI description', data: result };
    } catch (error) {
      console.error('Error toggling AI description:', error);
      return { error: 'Failed to toggle AI description' };
    }
  }
}
