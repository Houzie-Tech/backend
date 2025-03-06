import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(createReportDto: CreateReportDto, reportedById: string) {
    return await this.prisma.report.create({
      data: {
        reason: createReportDto.reason,
        listingId: createReportDto.listingId,
        reportedById,
        details: createReportDto.details,
        status: createReportDto.status,
      },
    });
  }

  async findAll() {
    return await this.prisma.report.findMany();
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto) {
    try {
      return await this.prisma.report.update({
        where: { id },
        data: updateReportDto,
      });
    } catch (error) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.report.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
  }

  async getSalesReport(startDate: Date, endDate: Date) {
    const reports = await this.prisma.report.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalReports = reports.length;
    return { totalReports, reports };
  }

  async getAnalytics() {
    const [totalReports, latestReports] = await Promise.all([
      this.prisma.report.count(),
      this.prisma.report.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      }),
    ]);

    return { totalReports, latestReports };
  }
}
