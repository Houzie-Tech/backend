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
import { PropertySearchDto } from './dto/property-search.dto';
import { generateAiDescription } from './util/listingsAi.util';
import { MetroStationService } from 'src/metro-station/metro-station.service';
import { ListingMetroService } from './services/listing-metro.service';
import { ListingCreator } from './services/listing-creator.service';

@Injectable()
export class FormService {
  constructor(
    private prisma: PrismaService,
    private metroStationService: MetroStationService,
    private listingMetroService: ListingMetroService,
    private listingCreator: ListingCreator,
  ) {}

  async create(createFormDto: CreateFormDto, brokerId: string) {
    try {
      return await this.prisma.$transaction(
        async (prisma) => {
          // ListingCreator service to create the listing
          const listing = await this.listingCreator.createListing(
            prisma,
            createFormDto,
            brokerId,
          );
          await this.listingMetroService.createMetroStationRelations(
            prisma,
            listing.id,
            {
              latitude: listing.location.latitude,
              longitude: listing.location.longitude,
            },
          );

          // Fetch the complete listing with all related data
          return this.listingCreator.fetchListingWithDetails(
            prisma,
            listing.id,
          );
        },
        {
          maxWait: 5000,
          timeout: 10000,
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error) {
      this.handleError(error);
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

  async findAll(searchParams: PropertySearchDto): Promise<{
    data: (ReturnType<typeof this.getListingSelect> & { distance?: number })[];
    metadata: {
      total: number;
      filtered: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
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
        distanceInKm = 50,
        page = 1,
        limit = 10,
        preferredTenant,
        preferredGender,
        furnishing,
        amenities,
        features,
        configuration,
        isActive = true,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = searchParams;

      const skip = (page - 1) * limit;
      const where: Prisma.ListingWhereInput = {};

      // Only add filters if they're explicitly provided
      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      // Price range filter
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = minPrice;
        if (maxPrice !== undefined) where.price.lte = maxPrice;
      }

      // Bedrooms filter with null handling
      if (minBedrooms !== undefined || maxBedrooms !== undefined) {
        where.bedrooms = {};
        if (minBedrooms !== undefined) where.bedrooms.gte = minBedrooms;
        if (maxBedrooms !== undefined) where.bedrooms.lte = maxBedrooms;
      }

      // Bathrooms filter with null handling
      if (minBathrooms !== undefined || maxBathrooms !== undefined) {
        where.bathrooms = {};
        if (minBathrooms !== undefined) where.bathrooms.gte = minBathrooms;
        if (maxBathrooms !== undefined) where.bathrooms.lte = maxBathrooms;
      }

      // Property type filter
      if (propertyType?.length) {
        where.propertyType = { in: propertyType };
      }

      // Preferred tenant filter
      if (preferredTenant) {
        where.preferredTenant = preferredTenant;
      }

      // Preferred gender filter - ensure it's properly formatted as an array
      if (preferredGender?.length) {
        where.preferredGender = {
          hasSome: preferredGender,
        };
      }

      // Furnishing filter
      if (furnishing) {
        where.furnishing = furnishing;
      }

      // Amenities filter - ensure it's properly formatted as an array
      if (amenities?.length) {
        // For each amenity, we need to ensure the listing has that amenity
        // Using hasSome to check if the listing's amenities array contains any of the requested amenities
        where.amenities = {
          hasSome: amenities,
        };
      }

      // Features filter - ensure it's properly formatted as an array
      if (features?.length) {
        where.features = {
          hasSome: features,
        };
      }

      // Configuration filter
      if (configuration) {
        where.configuration = configuration;
      }

      // Location range filter - use database for initial filtering
      if (latitude !== undefined && longitude !== undefined) {
        const degreeRadius = (distanceInKm * 1.2) / 111.32;
        const minLat = latitude - degreeRadius;
        const maxLat = latitude + degreeRadius;
        const longitudeRadius =
          degreeRadius / Math.cos(this.toRadians(latitude)) || degreeRadius;
        const minLng = longitude - longitudeRadius;
        const maxLng = longitude + longitudeRadius;

        where.location = {
          latitude: {
            gte: minLat,
            lte: maxLat,
          },
          longitude: {
            gte: minLng,
            lte: maxLng,
          },
        };
      }

      // Log the where clause for debugging
      console.log('Query filters:', JSON.stringify(where, null, 2));

      // Get filtered listings with sorting and include metro stations
      const listings = await this.prisma.listing.findMany({
        where,
        select: {
          ...this.getListingSelect(),
          metroStations: {
            include: {
              metroStation: true,
            },
            orderBy: {
              distanceInKm: 'asc',
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      });

      // Count total matching records for pagination
      const filteredCount = await this.prisma.listing.count({ where });

      // If no results found with all filters, try with fewer filters
      if (listings.length === 0) {
        // Create a copy of the original where clause
        const relaxedWhere = { ...where };

        // Remove array-based filters first as they're more restrictive
        delete relaxedWhere.amenities;
        delete relaxedWhere.features;
        delete relaxedWhere.preferredGender;

        console.log('Relaxed filters:', JSON.stringify(relaxedWhere, null, 2));

        // Try with relaxed filters
        const relaxedListings = await this.prisma.listing.findMany({
          where: relaxedWhere,
          select: {
            ...this.getListingSelect(),
            metroStations: {
              include: {
                metroStation: true,
              },
              orderBy: {
                distanceInKm: 'asc',
              },
            },
          },
          orderBy: {
            [sortBy]: sortOrder,
          },
          skip,
          take: limit,
        });

        // If we still have no results, use minimal filtering
        if (relaxedListings.length === 0) {
          console.log('Using minimal filters');

          // Use only isActive filter to ensure we get some results
          const minimalListings = await this.prisma.listing.findMany({
            where: { isActive: true },
            select: {
              ...this.getListingSelect(),
              metroStations: {
                include: {
                  metroStation: true,
                },
                orderBy: {
                  distanceInKm: 'asc',
                },
              },
            },
            orderBy: {
              [sortBy]: sortOrder,
            },
            skip,
            take: limit,
          });

          const totalCount = await this.prisma.listing.count({
            where: { isActive: true },
          });

          // Format the listings to include metro stations in a cleaner format
          const formattedListings = minimalListings.map((listing) => {
            const { metroStations, ...listingWithoutMetroStations } = listing;
            return {
              ...listingWithoutMetroStations,
              nearbyMetroStations: metroStations.map((relation) => ({
                id: relation.metroStation.id,
                name: relation.metroStation.name,
                line: relation.metroStation.line,
              })),
            };
          });

          return {
            data: formattedListings,
            metadata: {
              total: totalCount,
              filtered: formattedListings.length,
              page,
              limit,
              totalPages: Math.ceil(totalCount / limit),
            },
          };
        }

        // Format the relaxed listings
        const formattedRelaxedListings = relaxedListings.map((listing) => {
          const { metroStations, ...listingWithoutMetroStations } = listing;
          return {
            ...listingWithoutMetroStations,
            nearbyMetroStations: metroStations.map((relation) => ({
              id: relation.metroStation.id,
              name: relation.metroStation.name,
              line: relation.metroStation.line,
            })),
          };
        });

        // Return relaxed filter results
        const relaxedCount = await this.prisma.listing.count({
          where: relaxedWhere,
        });

        return {
          data: formattedRelaxedListings,
          metadata: {
            total: relaxedCount,
            filtered: formattedRelaxedListings.length,
            page,
            limit,
            totalPages: Math.ceil(relaxedCount / limit),
          },
        };
      }

      // Format the listings to include metro stations in a cleaner format
      let formattedListings = listings.map((listing) => {
        const { metroStations, ...listingWithoutMetroStations } = listing;
        return {
          ...listingWithoutMetroStations,
          nearbyMetroStations: metroStations.map((relation) => ({
            id: relation.metroStation.id,
            name: relation.metroStation.name,
            line: relation.metroStation.line,
            distanceInKm: relation.distanceInKm,
            walkingTimeMin: relation.walkingTimeMin,
          })),
        };
      });

      // Apply exact distance filtering if location is provided
      if (latitude !== undefined && longitude !== undefined) {
        // Calculate distance from search location to each listing
        formattedListings = formattedListings
          .map((listing) => {
            const distance = this.calculateDistance(
              latitude,
              longitude,
              listing.location.latitude,
              listing.location.longitude,
            );
            return { ...listing, distance };
          })
          .filter((listing) => listing.distance <= distanceInKm);
      }

      return {
        data: formattedListings,
        metadata: {
          total: filteredCount,
          filtered: formattedListings.length,
          page,
          limit,
          totalPages: Math.ceil(filteredCount / limit),
        },
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async findPropertiesNearMetro(
    metroStationId: string,
    maxDistance: number = 2,
  ) {
    try {
      // Get the metro station details
      const metroStation = await this.prisma.metroStation.findUnique({
        where: { id: parseInt(metroStationId) },
      });

      if (!metroStation) {
        throw new NotFoundException(
          `Metro station #${metroStationId} not found`,
        );
      }

      // Get all active listings
      const listings = await this.prisma.listing.findMany({
        where: { isActive: true },
        select: this.getListingSelect(),
      });

      // Calculate distance for each listing and filter
      const nearbyListings = listings
        .map((listing) => {
          const distance = this.calculateDistance(
            metroStation.latitude,
            metroStation.longitude,
            listing.location.latitude,
            listing.location.longitude,
          );
          return {
            ...listing,
            distanceToMetro: parseFloat(distance.toFixed(2)),
          };
        })
        .filter((listing) => listing.distanceToMetro <= maxDistance)
        .sort((a, b) => a.distanceToMetro - b.distanceToMetro);

      return {
        data: nearbyListings,
        metadata: {
          total: nearbyListings.length,
          metroStation: metroStation.name,
        },
      };
    } catch (error) {
      console.error('Error finding properties near metro:', error);
      throw new InternalServerErrorException(
        'An error occurred while fetching properties near metro station',
      );
    }
  }

  // Helper method to define the select object for listings
  private getListingSelect() {
    return {
      id: true,
      location: true,
      brokerId: true,
      broker: {
        select: {
          name: true,
          phoneNumber: true,
          email: true,
        },
      },
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
      amenities: true,
      balconies: true,
      configuration: true,
      features: true,
      furnishing: true,
      preferredTenant: true,
      preferredGender: true,
      createdAt: true,
      updatedAt: true,
      views: true,
      status: true,
    };
  }

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

  async findOne(id: string, userId?: string) {
    try {
      // Fetch the listing with related data (location and broker details)
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

      // If the listing is not found, throw a NotFoundException
      if (!listing) {
        throw new NotFoundException(`Listing #${id} not found`);
      }

      const nearbyMetroStations =
        await this.metroStationService.findNearbyMetroStations(
          listing.location.latitude,
          listing.location.longitude,
          10000,
        );

      let aiGeneratedDescription: string | null = null;

      if (listing.descriptionAi && userId) {
        const userData = await this.prisma.user.findUnique({
          where: { id: userId },
          include: {
            favorites: true,
            visitedListings: true,
          },
        });

        if (userData) {
          aiGeneratedDescription = await generateAiDescription(
            listing,
            userData.favorites,
            userData.visitedListings,
          );
        }
      }

      // Prepare the final description
      const newDescription = aiGeneratedDescription || listing.description;

      return {
        ...listing,
        description: newDescription,
        nearbyMetroStations,
      };
    } catch (error) {
      console.error('Error in findOne:', error);
      throw new Error('Failed to fetch listing details');
    }
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

  private handleError(error: any) {
    console.log('error', error);
    if (error instanceof NotFoundException) {
      throw error;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new ConflictException(
            'A listing with these details already exists',
          );
        case 'P2003':
          throw new BadRequestException('Invalid reference to related record');
        case 'P2025':
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
    throw new InternalServerErrorException(
      'An unexpected error occurred while creating the listing',
    );
  }
}
