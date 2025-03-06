import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  create(
    @Body() createReportDto: CreateReportDto,
    @GetUser('sub') userId: string,
  ) {
    return this.reportsService.create(createReportDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reports' })
  findAll() {
    return this.reportsService.findAll();
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get report analytics' })
  getAnalytics() {
    return this.reportsService.getAnalytics();
  }

  @Get('sales')
  @ApiOperation({ summary: 'Get sales report between dates' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  getSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getSalesReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a report by id' })
  @ApiParam({ name: 'id', type: 'string' })
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a report' })
  @ApiParam({ name: 'id', type: 'string' })
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportsService.update(id, updateReportDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a report' })
  @ApiParam({ name: 'id', type: 'string' })
  remove(@Param('id') id: string) {
    return this.reportsService.remove(id);
  }
}
