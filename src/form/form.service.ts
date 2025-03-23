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

@Injectable()
export class FormService {
  constructor(
    private prisma: PrismaService,
    private metroStationService: MetroStationService,
  ) {}

  async create(createFormDto: CreateFormDto, brokerId: string) {
    try {
      return await this.prisma.$transaction(
        async (prisma) => {
          const {
            location,
            occupants,
            roomFurnishingItems,
            houseFurnishingItems,
            maidChargesPerPerson,
            cookChargesPerPerson,
            wifiChargesPerPerson,
            otherMaintenanceCharges,
            otherMaintenanceDetails,
            ...listingDetails
          } = createFormDto;

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

          // Check if pre-occupied property type requires additional fields
          const isPreoccupiedSpecialType =
            listingDetails.isPreoccupied &&
            ['VILLA', 'BUILDER_FLOOR', 'FLAT_APARTMENT'].includes(
              listingDetails.propertyType,
            );

          // Create the listing with all related records
          const listing = await prisma.listing.create({
            data: {
              ...listingDetails,
              // Add pre-occupied specific fields only if applicable
              ...(isPreoccupiedSpecialType && roomFurnishingItems
                ? { roomFurnishingItems }
                : {}),
              ...(isPreoccupiedSpecialType && houseFurnishingItems
                ? { houseFurnishingItems }
                : {}),
              ...(isPreoccupiedSpecialType && maidChargesPerPerson !== undefined
                ? { maidChargesPerPerson }
                : {}),
              ...(isPreoccupiedSpecialType && cookChargesPerPerson !== undefined
                ? { cookChargesPerPerson }
                : {}),
              ...(isPreoccupiedSpecialType && wifiChargesPerPerson !== undefined
                ? { wifiChargesPerPerson }
                : {}),
              ...(isPreoccupiedSpecialType &&
              otherMaintenanceCharges !== undefined
                ? { otherMaintenanceCharges }
                : {}),
              ...(isPreoccupiedSpecialType && otherMaintenanceDetails
                ? { otherMaintenanceDetails }
                : {}),
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

          // If the property is pre-occupied and occupants data is provided, create occupant records
          if (
            listingDetails.isPreoccupied &&
            occupants &&
            occupants.length > 0
          ) {
            await Promise.all(
              occupants.map((occupant) =>
                prisma.occupant.create({
                  data: {
                    ...occupant,
                    listing: {
                      connect: {
                        id: listing.id,
                      },
                    },
                  },
                }),
              ),
            );
          }

          // Fetch the listing with occupants data and pre-occupied details for the response
          return prisma.listing.findUnique({
            where: { id: listing.id },
            include: {
              Occupant: true,
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

      // Get filtered listings with sorting
      const listings = await this.prisma.listing.findMany({
        where,
        select: this.getListingSelect(),
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
          select: this.getListingSelect(),
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
            select: this.getListingSelect(),
            orderBy: {
              [sortBy]: sortOrder,
            },
            skip,
            take: limit,
          });

          const totalCount = await this.prisma.listing.count({
            where: { isActive: true },
          });

          return {
            data: minimalListings,
            metadata: {
              total: totalCount,
              filtered: minimalListings.length,
              page,
              limit,
              totalPages: Math.ceil(totalCount / limit),
            },
          };
        }

        // Return relaxed filter results
        const relaxedCount = await this.prisma.listing.count({
          where: relaxedWhere,
        });

        return {
          data: relaxedListings,
          metadata: {
            total: relaxedCount,
            filtered: relaxedListings.length,
            page,
            limit,
            totalPages: Math.ceil(relaxedCount / limit),
          },
        };
      }

      // Apply exact distance filtering if location is provided
      let filteredListings = listings;
      if (latitude !== undefined && longitude !== undefined) {
        filteredListings = (
          await Promise.all(
            listings.map(async (listing) => {
              const distance = this.calculateDistance(
                latitude,
                longitude,
                listing.location.latitude,
                listing.location.longitude,
              );

              // Find nearby metro stations for each listing
              const nearbyMetroStations =
                await this.metroStationService.findNearbyMetroStations(
                  listing.location.latitude,
                  listing.location.longitude,
                  1000,
                );

              return {
                ...listing,
                distance,
                nearbyMetroStations,
              } as typeof listing & { distance: number };
            }),
          )
        ).filter((listing) => listing.distance <= distanceInKm);
      }

      return {
        data: filteredListings,
        metadata: {
          total: filteredCount,
          filtered: filteredListings.length,
          page,
          limit,
          totalPages: Math.ceil(filteredCount / limit),
        },
      };
    } catch (error) {
      console.error('Error in findAll:', error);

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Invalid filter parameters provided');
      }

      throw new InternalServerErrorException(
        'An error occurred while fetching listings',
      );
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
}
