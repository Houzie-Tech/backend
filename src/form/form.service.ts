import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocationDto } from './dto/location.dto';
import { Role } from '@prisma/client';

@Injectable()
export class FormService {
  constructor(private prisma: PrismaService) {}

  async create(createFormDto: CreateFormDto, brokerId: string) {
    // check if the broker exist
    const broker = await this.prisma.user.findFirst({
      where: {
        id: brokerId,
        role: Role.BROKER,
      },
    });
    if (!broker) {
      throw new NotFoundException(`Broker #${brokerId} not found`);
    }
    const { location, ...listingDetails } = createFormDto;
    const locationDetails = await this.createLocation(location);

    // Create a listing
    const listing = await this.prisma.listing.create({
      data: {
        bathrooms: listingDetails.bathrooms,
        bedrooms: listingDetails.bedrooms,
        brokerId, // Broker's ID
        configuration: listingDetails.configuration,
        description: listingDetails.description,
        locationId: locationDetails.id,
        price: listingDetails.price,
        furnishing: listingDetails.furnishing,
        propertyType: listingDetails.propertyType,
        title: listingDetails.title,
        rentFor: listingDetails.rentFor,
        photos: listingDetails.photos,
        rentDetails: listingDetails.rentDetails
          ? {
              create: {
                availableFrom: listingDetails.rentDetails.availableFrom,
                deposit: listingDetails.rentDetails.deposit,
                rentAmount: listingDetails.rentDetails.rentAmount,
              },
            }
          : undefined, // Conditionally create rentDetails if provided
        sellDetails: listingDetails.sellDetails
          ? {
              create: {
                askingPrice: listingDetails.sellDetails.askingPrice,
              },
            }
          : undefined, // Conditionally create sellDetails if provided
      },
      include: {
        location: true, // Optionally include location details in the response
        rentDetails: true, // Optionally include rentDetails in the response
        sellDetails: true, // Optionally include sellDetails in the response
      },
    });
    return listing;
    // attach sell and rent details if available
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
    await this.prisma.location.create({
      data: {
        city,
        state,
        country,
        latitude,
        longitude,
      },
      select: {
        id: true,
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
