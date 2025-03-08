import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { AuthGuard } from '../auth/guards/jwt.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FilterLeadsByListingDto } from './dto/filter.dto';

@UseGuards(AuthGuard)
@Roles('ADMIN', 'BROKER')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  // Create a new lead
  @Post()
  async create(
    @Body() createLeadDto: CreateLeadDto,
    @GetUser('sub') userId: string,
  ) {
    return this.leadsService.create(createLeadDto, userId);
  }

  // Fetch all leads with optional search
  @Get()
  async findAll(
    @GetUser('sub') userId: string,
    @Query('query') query?: string,
  ) {
    return this.leadsService.findAll(userId, { query });
  }

  @Get('filter/listing')
  async filterByListing(
    @GetUser('sub') userId: string,
    @Query(new ValidationPipe({ transform: true }))
    filterDto: FilterLeadsByListingDto,
  ) {
    return this.leadsService.filterByListing(userId, filterDto);
  }
  // Fetch a single lead by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  // Update a lead by ID
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  // Remove a lead by ID
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser('sub') brokerId: string) {
    return this.leadsService.remove(id, brokerId);
  }
}
