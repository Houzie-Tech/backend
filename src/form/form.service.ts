import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocationDto } from './dto/location.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FormService {
  constructor(private prisma: PrismaService) {}

  async create(createFormDto: CreateFormDto, brokerId: string) {
    try {
      return await this.prisma.$transaction(
        async (prisma) => {
          const { location, ...listingDetails } = createFormDto;

          // Create location within the same transaction
          const locationDetails = await this.createLocationInTransaction(
            location,
            prisma,
          );
          if (!locationDetails) {
            throw new InternalServerErrorException(
              'Failed to create or find location',
            );
          }

          // Create the listing with all related records
          const data = await prisma.listing.create({
            data: {
              ...listingDetails,
              location: {
                connect: {
                  id: locationDetails.id,
                },
              },
              broker: {
                connect: {
                  id: brokerId,
                },
              },
            },
          });
          return data;
        },
        {
          // Transaction configuration
          maxWait: 5000, // 5s maximum waiting time
          timeout: 10000, // 10s maximum transaction time
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // Highest isolation level
        },
      );
    } catch (error) {
      console.log('error', error);
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException as is
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma errors
        switch (error.code) {
          case 'P2002': // Unique constraint violation
            throw new ConflictException(
              'A listing with these details already exists',
            );
          case 'P2003': // Foreign key constraint failure
            throw new BadRequestException(
              'Invalid reference to related record',
            );
          case 'P2025': // Record not found
            throw new NotFoundException('Required record not found');
          default:
            throw new InternalServerErrorException(
              `Database error occurred: ${error.message}`,
            );
        }
      }
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Invalid data provided');
      }
      // Handle any other unexpected errors
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the listing',
      );
    }
  }

  private async createLocationInTransaction(
    locationDetails: LocationDto,
    prisma: Prisma.TransactionClient,
  ) {
    const { city, state, country, latitude, longitude } = locationDetails;

    try {
      // Check if location exists
      const existingLocation = await prisma.location.findFirst({
        where: {
          latitude,
          longitude,
        },
      });

      if (existingLocation) {
        return existingLocation;
      }

      // Create new location
      return await prisma.location.create({
        data: {
          city,
          state,
          country,
          latitude,
          longitude,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            // Handle potential race condition where location was created between check and create
            const location = await prisma.location.findFirst({
              where: {
                latitude,
                longitude,
              },
            });
            if (location) return location;
            throw new ConflictException('Location already exists');
          default:
            throw new InternalServerErrorException(
              `Failed to create location: ${error.message}`,
            );
        }
      }
      throw error;
    }
  }

  async createLocation(locationDetails: LocationDto) {
    const { city, state, country, latitude, longitude } = locationDetails;

    // check if location already exists
    const existingLocation = await this.prisma.location.findFirst({
      where: {
        latitude,
        longitude,
      },
    });

    if (existingLocation) {
      return existingLocation;
    }

    // Return the newly created location
    return await this.prisma.location.create({
      data: {
        city,
        state,
        country,
        latitude,
        longitude,
      },
    });
  }

  async findAll(filters: any) {
    try {
      const {
        minPrice,
        maxPrice,
        minBedrooms,
        maxBedrooms,
        minBathrooms,
        maxBathrooms,
        propertyType,
        latitude,
        longitude,
        distanceInKm = 10,
        page = 1,
        limit = 10,
      } = filters;

      const skip = (page - 1) * limit;
      const where: Prisma.ListingWhereInput = {};

      // Price range filter
      if (minPrice || maxPrice) {
        where.price = {
          gte: minPrice,
          lte: maxPrice,
        };
      }

      if (minBedrooms || maxBedrooms) {
        where.bedrooms = {
          gte: minBedrooms,
          lte: maxBedrooms,
        };
      }

      if (minBathrooms || maxBathrooms) {
        where.bathrooms = {
          gte: minBathrooms,
          lte: maxBathrooms,
        };
      }

      if (propertyType?.length) {
        where.propertyType = { in: propertyType };
      }
      // Location range filter using a more generous bounding box
      if (latitude !== undefined && longitude !== undefined) {
        // Use a slightly larger bounding box to account for Earth's curvature
        const degreeRadius = (distanceInKm * 1.2) / 111.32;

        // Calculate bounding box
        const minLat = latitude - degreeRadius;
        const maxLat = latitude + degreeRadius;
        // Adjust for longitude distance varying with latitude
        const longitudeRadius =
          degreeRadius / Math.cos(this.toRadians(latitude)) || degreeRadius;
        const minLng = longitude - longitudeRadius;
        const maxLng = longitude + longitudeRadius;

        where.location = {
          AND: [
            { latitude: { gte: minLat } },
            { latitude: { lte: maxLat } },
            { longitude: { gte: minLng } },
            { longitude: { lte: maxLng } },
          ],
        };

        console.log('Bounding Box:', {
          latRange: [minLat, maxLat],
          lngRange: [minLng, maxLng],
        });
      }

      // Get the filtered listings
      const listings = await this.prisma.listing.findMany({
        where,
        select: {
          id: true,
          location: true,
          brokerId: true,
          isActive: true,
          price: true,
          propertyType: true,
          bedrooms: true,
          bathrooms: true,
          mainImage: true,
          photos: true,
          title: true,
          description: true,
          isPreoccupied: true,
          brokerage: true,
          security: true,
          maintenanceCharges: true,
          isMaintenanceIncluded: true,
          isNegotiable: true,
          lockInPeriod: true,
          availableFrom: true,
        },
      });
      // Filter by exact distance
      let filteredListings = listings;
      if (latitude !== undefined && longitude !== undefined) {
        filteredListings = listings.filter((listing) => {
          const distance = this.calculateDistance(
            latitude,
            longitude,
            listing.location.latitude,
            listing.location.longitude,
          );
          console.log(`Distance for listing ${listing.id}: ${distance}km`);
          return distance <= distanceInKm;
        });
      }

      // Apply pagination after distance filtering
      const total = filteredListings.length;
      const paginatedListings = filteredListings.slice(skip, skip + limit);

      return {
        data: paginatedListings,
        metadata: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Invalid filter parameters provided');
      }
      throw new InternalServerErrorException(
        'An error occurred while fetching listings',
      );
    }
  }
  // Helper method to calculate distance using Haversine formula
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        location: true,
        broker: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException(`Listing #${id} not found`);
    }

    return listing;
  }

  async update(id: string, updateFormDto: UpdateFormDto, userId: string) {
    // Check if listing exists and user has permission
    const existingListing = await this.prisma.listing.findFirst({
      where: {
        id,
        brokerId: userId,
      },
    });

    if (!existingListing) {
      throw new NotFoundException(
        `Listing #${id} not found or you don't have permission to update it`,
      );
    }

    // Destructure to remove location from update data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { location, ...listingData } = updateFormDto;

    // Update listing without location
    return this.prisma.listing.update({
      where: { id },
      data: listingData,
      include: {
        location: true,
        broker: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    // Check if listing exists and user has permission
    const listing = await this.prisma.listing.findFirst({
      where: {
        id,
        brokerId: userId,
      },
    });

    if (!listing) {
      throw new NotFoundException(
        `Listing #${id} not found or you don't have permission to delete it`,
      );
    }

    // Delete the listing
    await this.prisma.listing.delete({
      where: { id },
    });

    // Delete the associated location
    await this.prisma.location.delete({
      where: { id: listing.locationId },
    });

    return { message: 'Listing deleted successfully' };
  }
}
