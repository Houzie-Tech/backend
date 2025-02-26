import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface BrokerScore {
  listingScore: number;
  responseScore: number;
  conversionScore: number;
  totalScore: number;
}

@Injectable()
export class BrokerAdminService {
  constructor(private prisma: PrismaService) {}

  async calculateBrokerScore(brokerId: string): Promise<BrokerScore> {
    const [listingMetrics, responseMetrics, conversionMetrics] =
      await Promise.all([
        this.calculateListingScore(brokerId),
        this.calculateResponseScore(brokerId),
        this.calculateConversionScore(brokerId),
      ]);

    const totalScore =
      listingMetrics.score * 0.3 + // 30% weight for listings
      responseMetrics.score * 0.3 + // 30% weight for response time
      conversionMetrics.score * 0.4; // 40% weight for conversions

    return {
      listingScore: listingMetrics.score,
      responseScore: responseMetrics.score,
      conversionScore: conversionMetrics.score,
      totalScore: Number(totalScore.toFixed(2)),
    };
  }

  private async calculateListingScore(brokerId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const listingMetrics = await this.prisma.listing.aggregate({
      where: {
        brokerId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true, // total listings
      },
      _avg: {
        views: true, // average views per listing
      },
    });

    // Get platform averages for comparison
    const platformAverages = await this.prisma.listing.aggregate({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _avg: {
        views: true,
      },
      _count: {
        id: true,
      },
    });

    // Calculate listing activity score (0-100)
    const avgListingsPerBroker =
      platformAverages._count.id /
      (await this.prisma.user.count({
        where: { role: 'BROKER' },
      }));

    const listingScore = Math.min(
      100,
      // Score based on number of listings
      (listingMetrics._count.id / avgListingsPerBroker) * 50 +
        // Score based on views
        (listingMetrics._avg.views / platformAverages._avg.views) * 50,
    );

    return {
      score: Number(listingScore.toFixed(2)),
      totalListings: listingMetrics._count.id,
      avgViews: listingMetrics._avg.views,
    };
  }

  private async calculateResponseScore(brokerId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get broker's response times to leads
    const responseMetrics = await this.prisma.lead.aggregate({
      where: {
        brokerId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _avg: {
        firstResponseTime: true, // Time in minutes to first response
      },
      _count: {
        id: true,
      },
    });

    // Get platform average response time
    const platformAvgResponse = await this.prisma.lead.aggregate({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _avg: {
        firstResponseTime: true,
      },
    });

    // Calculate response score (0-100)
    // Lower response time is better
    // Target response time: 30 minutes
    const targetResponseTime = 30; // minutes
    const actualResponseTime = responseMetrics._avg.firstResponseTime || 0;
    const platformResponseTime =
      platformAvgResponse._avg.firstResponseTime || 0;

    const responseScore = Math.min(
      100,
      // Score based on target response time (60%)
      Math.max(0, 100 - (actualResponseTime / targetResponseTime) * 60) +
        // Score based on comparison to platform average (40%)
        Math.max(0, 40 - (actualResponseTime / platformResponseTime) * 40),
    );

    return {
      score: Number(responseScore.toFixed(2)),
      avgResponseTime: actualResponseTime,
      totalLeadsResponded: responseMetrics._count.id,
    };
  }

  private async calculateConversionScore(brokerId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get broker's conversion metrics
    const brokerLeads = await this.prisma.lead.groupBy({
      by: ['status'],
      where: {
        brokerId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: true,
    });

    // Calculate conversion rate
    const totalLeads = brokerLeads.reduce(
      (sum, group) => sum + group._count,
      0,
    );
    const convertedLeads =
      brokerLeads.find((group) => group.status === 'CONVERTED')?._count || 0;
    const brokerConversionRate =
      totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Get platform average conversion rate
    const platformLeads = await this.prisma.lead.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: true,
    });

    const platformTotalLeads = platformLeads.reduce(
      (sum, group) => sum + group._count,
      0,
    );
    const platformConvertedLeads =
      platformLeads.find((group) => group.status === 'CONVERTED')?._count || 0;
    const platformConversionRate =
      platformTotalLeads > 0
        ? (platformConvertedLeads / platformTotalLeads) * 100
        : 0;

    // Calculate conversion score (0-100)
    const conversionScore = Math.min(
      100,
      // Score based on absolute conversion rate (60%)
      brokerConversionRate * 0.6 +
        // Score based on comparison to platform average (40%)
        (brokerConversionRate / platformConversionRate) * 40,
    );

    return {
      score: Number(conversionScore.toFixed(2)),
      conversionRate: Number(brokerConversionRate.toFixed(2)),
      totalLeads,
      convertedLeads,
    };
  }

  // Get top performing brokers
  async getTopBrokers(limit: number = 10) {
    const brokers = await this.prisma.user.findMany({
      where: { role: 'BROKER' },
      take: limit,
    });

    const brokerScores = await Promise.all(
      brokers.map(async (broker) => {
        const score = await this.calculateBrokerScore(broker.id);
        return {
          brokerId: broker.id,
          name: broker.name,
          ...score,
        };
      }),
    );

    return brokerScores.sort((a, b) => b.totalScore - a.totalScore);
  }
}
