import { Injectable } from '@nestjs/common';
import { LeadStatus, ListingStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getListingStatusBreakdown() {
    const statusCounts = await this.prisma.listing.groupBy({
      by: ['status'],
      _count: true,
    });

    const totalListings = await this.prisma.listing.count();

    return {
      totalListings,
      breakdown: statusCounts.map((status) => ({
        status: status.status,
        count: status._count,
        percentage: (status._count / totalListings) * 100,
      })),
    };
  }

  async getUserRegistrationStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily registrations
    const dailyRegistrations = await this.prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    });

    // Get user type breakdown
    const userTypeBreakdown = await this.prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    // Get verification stats
    const verificationStats = await this.prisma.userAuth.aggregate({
      _count: {
        _all: true,
        isEmailVerified: true,
        isPhoneVerified: true,
      },
    });

    return {
      dailyRegistrations,
      userTypeBreakdown,
      verificationStats,
      totalUsers: verificationStats._count._all,
    };
  }

  async getRecentActivities(limit: number = 10) {
    // Fetch recent listings
    const recentListings = await this.prisma.listing.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        broker: {
          select: {
            name: true,
          },
        },
      },
    });

    // Fetch recent leads
    const recentLeads = await this.prisma.lead.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        broker: {
          select: {
            name: true,
          },
        },
      },
    });

    // Fetch recent user registrations
    const recentUsers = await this.prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Combine and sort all activities
    const allActivities = [
      ...recentListings.map((listing) => ({
        type: 'LISTING',
        ...listing,
      })),
      ...recentLeads.map((lead) => ({
        type: 'LEAD',
        ...lead,
      })),
      ...recentUsers.map((user) => ({
        type: 'USER',
        ...user,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return allActivities.slice(0, limit);
  }

  async getLeadConversionMetrics(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get leads by status
    const leadsByStatus = await this.prisma.lead.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    });

    // Calculate conversion rate
    const totalLeads = await this.prisma.lead.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    const convertedLeads = await this.prisma.lead.count({
      where: {
        status: LeadStatus.CONVERTED,
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get leads by source
    const leadsBySource = await this.prisma.lead.groupBy({
      by: ['source'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    });

    return {
      leadsByStatus,
      leadsBySource,
      conversionRate: (convertedLeads / totalLeads) * 100,
      totalLeads,
      convertedLeads,
    };
  }

  async getQuickActionStats() {
    // Get pending listings count
    const pendingListings = await this.prisma.listing.count({
      where: {
        status: ListingStatus.PENDING,
      },
    });

    // Get new leads count
    const newLeads = await this.prisma.lead.count({
      where: {
        status: LeadStatus.NEW,
      },
    });

    // Get unverified users count
    const unverifiedUsers = await this.prisma.userAuth.count({
      where: {
        OR: [{ isEmailVerified: false }, { isPhoneVerified: false }],
      },
    });

    // Get high priority leads
    const urgentLeads = await this.prisma.lead.count({
      where: {
        priority: 'HIGH',
        status: {
          not: LeadStatus.CONVERTED,
        },
      },
    });

    return {
      pendingListings,
      newLeads,
      unverifiedUsers,
      urgentLeads,
      lastUpdated: new Date(),
    };
  }
}
