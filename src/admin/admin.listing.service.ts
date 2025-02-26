import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ListingAdminService {
  constructor(private prisma: PrismaService) {}

  async verifyListing(listingId: string, adminId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const updatedListing = await this.prisma.listing.update({
      where: { id: listingId },
      data: { verifiedById: adminId, verifiedAt: new Date() },
    });

    return updatedListing;
  }

  async getListingActivity(listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        leads: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    // Calculate lead conversion rate
    const totalLeads = listing.leads.length;
    const convertedLeads = listing.leads.filter(
      (lead) => lead.status === 'CONVERTED',
    ).length;
    const conversionRate =
      totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    return {
      views: listing.views,
      totalLeads,
      convertedLeads,
      conversionRate,
      lastUpdated: listing.updatedAt,
    };
  }

  // Monitor availability changes
  async updateListingAvailability(
    listingId: string,
    availableFrom: Date,
    isPreoccupied: boolean,
  ) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return this.prisma.listing.update({
      where: { id: listingId },
      data: {
        availableFrom,
        isPreoccupied,
        updatedAt: new Date(),
      },
    });
  }
}
