import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class BrokerService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return `This action returns all broker`;
  }

  async findOne(brokerId: string) {
    try {
      const brokerDetails = await this.prisma.user.findUniqueOrThrow({
        where: {
          id: brokerId,
          role: Role.BROKER,
        },
        select: {
          email: true,
          phoneNumber: true,
          name: true,
          createdAt: true,
        },
      });

      // Ensure the user has the BROKER role
      if (!brokerDetails) {
        throw new NotFoundException(`Broker with ID ${brokerId} not found`);
      }

      return brokerDetails;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma errors
        switch (error.code) {
          case 'P2025': // Record not found
            throw new NotFoundException(`Broker with ID ${brokerId} not found`);
          default:
            throw new InternalServerErrorException(
              `Database error occurred: ${error.message}`,
            );
        }
      } else if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException as is
      } else {
        // Handle unexpected errors
        throw new InternalServerErrorException(
          'An unexpected error occurred while fetching broker details',
        );
      }
    }
  }

  async getStats(brokerId: string) {
    try {
      const [activeListings, inActiveListings, activeLeads, inActiveLeads] =
        await Promise.all([
          this.prisma.listing.count({ where: { brokerId, isActive: true } }),
          this.prisma.listing.count({ where: { brokerId, isActive: false } }),
          this.prisma.lead.count({ where: { brokerId, isActive: true } }),
          this.prisma.lead.count({ where: { brokerId, isActive: false } }),
        ]);

      return { activeListings, inActiveListings, activeLeads, inActiveLeads };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching stats',
      );
    }
  }

  async getActiveLeads(brokerId: string) {
    try {
      const leads = await this.prisma.lead.findMany({
        where: { brokerId, isActive: true },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          source: true,
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return leads;
    } catch (error) {
      console.error('Error fetching active listings:', error);
      throw new InternalServerErrorException('Failed to fetch active listings');
    }
  }

  async getListingsFromBroker(brokerId: string) {
    try {
      const listings = await this.prisma.listing.findMany({
        where: { brokerId },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          brokerId: true,
          isActive: true,
          photos: true,
          mainImage: true,
          bathrooms: true,
          bedrooms: true,
          balconies: true,
          propertyType: true,
          views: true,
          price: true,
        },
      });

      return listings;
    } catch (error) {
      console.error('Error fetching listings for broker:', error);
      return { error: 'Failed to fetch listings', data: [] };
    }
  }

  async toggleAiDescription(listingId: string, toggle: boolean) {
    try {
      // Update the listing's AI description toggle status
      const listing = await this.prisma.listing.update({
        where: { id: listingId },
        data: {
          descriptionAi: toggle, // Toggle the AI description flag
        },
      });

      return {
        message: `Successfully updated the AI description toggle for listing ID: ${listingId}`,
        listing,
      };
    } catch (error) {
      console.error('Error toggling AI description:', error);
      return {
        error: 'Failed to update AI description toggle',
        details: error.message,
      };
    }
  }
}
