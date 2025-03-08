import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string) {
    try {
      const profile = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phoneNumber: true,
          role: true,
          aadharNumber: true,
          createdAt: true,
          updatedAt: true,
          companyName: true,
        },
      });
      return profile;
    } catch (error) {
      throw new NotFoundException('Profile not found');
    }
  }

  async update(userId: string, updateProfileDto: UpdateProfileDto) {
    try {
      const { name, aadharNumber, companyName } = updateProfileDto;
      const profile = await this.prisma.user.update({
        where: { id: userId },
        data: { name, aadharNumber, companyName },
      });
      return profile;
    } catch (error) {
      throw new NotFoundException('Profile not found');
    }
  }

  // Add a listing to favorites
  async addToFavorites(userId: string, listingId: string) {
    try {
      // Check if listing exists
      const listing = await this.prisma.listing.findUnique({
        where: { id: listingId },
      });

      if (!listing) {
        throw new NotFoundException('Listing not found');
      }

      // Check if already favorited
      const existingFavorite = await this.prisma.favoriteListing.findUnique({
        where: {
          userId_listingId: {
            userId,
            listingId,
          },
        },
      });

      if (existingFavorite) {
        throw new ConflictException('Listing is already in favorites');
      }

      // Add to favorites
      return await this.prisma.favoriteListing.create({
        data: {
          user: { connect: { id: userId } },
          listing: { connect: { id: listingId } },
        },
        include: {
          listing: true,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Failed to add listing to favorites: ${error.message}`);
    }
  }

  // Remove a listing from favorites
  async removeFromFavorites(userId: string, listingId: string) {
    try {
      const favorite = await this.prisma.favoriteListing.findUnique({
        where: {
          userId_listingId: {
            userId,
            listingId,
          },
        },
      });

      if (!favorite) {
        throw new NotFoundException('Listing not found in favorites');
      }

      return await this.prisma.favoriteListing.delete({
        where: {
          userId_listingId: {
            userId,
            listingId,
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to remove listing from favorites: ${error.message}`,
      );
    }
  }

  // Get all favorite listings for a user
  async getFavoriteListings(userId: string) {
    try {
      const favorites = await this.prisma.favoriteListing.findMany({
        where: { userId },
        include: {
          listing: {
            include: {
              location: true,
            },
          },
        },
      });

      return favorites;
    } catch (error) {
      throw new Error(`Failed to fetch favorite listings: ${error.message}`);
    }
  }

  // Mark a listing as visited
  async markListingAsVisited(userId: string, listingId: string) {
    try {
      // Check if listing exists
      const listing = await this.prisma.listing.findUnique({
        where: { id: listingId },
      });

      if (!listing) {
        throw new NotFoundException('Listing not found');
      }

      // Create or update visited record
      return await this.prisma.visitedListing.upsert({
        where: {
          userId_listingId: {
            userId,
            listingId,
          },
        },
        update: {
          visitedAt: new Date(), // Update the timestamp if already visited
        },
        create: {
          user: { connect: { id: userId } },
          listing: { connect: { id: listingId } },
        },
        include: {
          listing: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to mark listing as visited: ${error.message}`);
    }
  }

  // Get all visited listings for a user
  async getVisitedListings(userId: string) {
    try {
      const visitedListings = await this.prisma.visitedListing.findMany({
        where: { userId },
        include: {
          listing: {
            include: {
              location: true,
            },
          },
        },
        orderBy: {
          visitedAt: 'desc', // Most recently visited first
        },
      });

      return visitedListings;
    } catch (error) {
      throw new Error(`Failed to fetch visited listings: ${error.message}`);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
