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
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class FormService {
  constructor(private prisma: PrismaService) {}

  async create(createFormDto: CreateFormDto, brokerId: string) {
    try {
      return await this.prisma.$transaction(
        async (prisma) => {
          // Check if broker exists
          const broker = await prisma.user.findFirst({
            where: {
              id: brokerId,
              role: Role.BROKER,
            },
          });

          if (!broker) {
            throw new NotFoundException(`Broker #${brokerId} not found`);
          }

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
          return await prisma.listing.create({
            data: {
              bathrooms: listingDetails.bathrooms,
              bedrooms: listingDetails.bedrooms,
              brokerId,
              configuration: listingDetails.configuration,
              description: listingDetails.description,
              locationId: locationDetails.id,
              price: listingDetails.price,
              furnishing: listingDetails.furnishing,
              propertyType: listingDetails.propertyType,
              title: listingDetails.title,
              rentFor: listingDetails.rentFor,
              photos: listingDetails.photos,
              rentDetails: listingDetails.rentDetails && {
                create: {
                  availableFrom: listingDetails.rentDetails.availableFrom,
                  deposit: listingDetails.rentDetails.deposit,
                  rentAmount: listingDetails.rentDetails.rentAmount,
                },
              },
              sellDetails: listingDetails.sellDetails && {
                create: {
                  askingPrice: listingDetails.sellDetails.askingPrice,
                },
              },
            },
            include: {
              location: true,
              rentDetails: true,
              sellDetails: true,
            },
          });
        },
        {
          // Transaction configuration
          maxWait: 5000, // 5s maximum waiting time
          timeout: 10000, // 10s maximum transaction time
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // Highest isolation level
        },
      );
    } catch (error) {
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

  // Separate method for creating location within a transaction
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

  async findAll(
    skip = 0,
    take = 10,
    status?: string,
    minPrice?: number,
    maxPrice?: number,
  ) {
    // const where = {
    //   ...(status && { status }),
    //   ...(minPrice && { price: { gte: minPrice } }),
    //   ...(maxPrice && { price: { lte: maxPrice } }),
    // };

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        skip,
        take,
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.listing.count(),
    ]);

    return {
      listings,
      metadata: {
        total,
        skip,
        take,
      },
    };
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
      include: {
        location: true,
      },
    });

    if (!existingListing) {
      throw new NotFoundException(
        `Listing #${id} not found or you don't have permission to update it`,
      );
    }

    // Update location if provided
    if (
      updateFormDto.city ||
      updateFormDto.state ||
      updateFormDto.country ||
      updateFormDto.latitude ||
      updateFormDto.longitude
    ) {
      await this.prisma.location.update({
        where: { id: existingListing.locationId },
        data: {
          city: updateFormDto.city,
          state: updateFormDto.state,
          country: updateFormDto.country,
          latitude: updateFormDto.latitude,
          longitude: updateFormDto.longitude,
        },
      });
    }

    // Update listing
    return this.prisma.listing.update({
      where: { id },
      data: {
        title: updateFormDto.title,
        description: updateFormDto.description,
        price: updateFormDto.price,
      },
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
