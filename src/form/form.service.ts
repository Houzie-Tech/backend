import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class FormService {
  constructor(private prisma: PrismaService) {}

  async create(createFormDto: CreateFormDto, brokerId: string) {
    const {
      city,
      country,
      latitude,
      longitude,
      state,
      description,
      price,
      title,
    } = createFormDto;

    const broker = await this.prisma.user.findFirst({
      where: {
        id: brokerId,
        role: Role.BROKER,
      },
    });
    if (!broker) {
      throw new BadRequestException('Only brokers can create listings');
    }

    // Create the location first
    const location = await this.prisma.location.create({
      data: {
        city,
        state,
        country,
        latitude,
        longitude,
      },
    });

    return this.prisma.listing.create({
      data: {
        title,
        description,
        price,
        brokerId: brokerId,
        locationId: location.id,
        status: 'PENDING', // Default status
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

  async findAll(
    skip = 0,
    take = 10,
    status?: string,
    minPrice?: number,
    maxPrice?: number,
  ) {
    const where = {
      ...(status && { status }),
      ...(minPrice && { price: { gte: minPrice } }),
      ...(maxPrice && { price: { lte: maxPrice } }),
    };

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        skip,
        take,
        where,
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
      this.prisma.listing.count({ where }),
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
        status: updateFormDto.status,
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
