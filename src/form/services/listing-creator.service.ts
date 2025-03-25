import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Listing } from '@prisma/client';
import { CreateFormDto, OccupantDto } from '../dto';
import { LocationDto } from '../dto/location.dto';

@Injectable()
export class ListingCreator {
  async createListing(
    prisma: Prisma.TransactionClient,
    createFormDto: CreateFormDto,
    brokerId: string,
  ): Promise<Listing & { location: any }> {
    const { location, occupants, ...listingDetails } = createFormDto;

    const locationDetails = await this.createLocationInTransaction(
      location,
      prisma,
    );
    if (!locationDetails) {
      throw new InternalServerErrorException(
        'Failed to create or find location',
      );
    }

    const isPreoccupiedSpecialType =
      this.isPreoccupiedSpecialPropertyType(listingDetails);

    const listing = await this.createListingRecord(
      prisma,
      listingDetails,
      locationDetails.id,
      brokerId,
      isPreoccupiedSpecialType,
    );

    if (listingDetails.isPreoccupied && occupants?.length > 0) {
      await this.createOccupants(prisma, occupants, listing.id);
    }

    // Fetch the listing with its location to ensure it's included
    const listingWithLocation = await prisma.listing.findUnique({
      where: { id: listing.id },
      include: { location: true },
    });

    return listingWithLocation;
  }

  private isPreoccupiedSpecialPropertyType(
    listingDetails: Partial<CreateFormDto>,
  ): boolean {
    return (
      listingDetails.isPreoccupied &&
      ['VILLA', 'BUILDER_FLOOR', 'FLAT_APARTMENT'].includes(
        listingDetails.propertyType as string,
      )
    );
  }

  private async createListingRecord(
    prisma: Prisma.TransactionClient,
    listingDetails: Partial<CreateFormDto>,
    locationId: string,
    brokerId: string,
    isPreoccupiedSpecialType: boolean,
  ): Promise<Listing> {
    const filteredData = this.filterListingData(
      listingDetails,
      isPreoccupiedSpecialType,
    );

    return prisma.listing.create({
      data: {
        ...filteredData,
        location: { connect: { id: locationId } },
        broker: { connect: { id: brokerId } },
      },
    });
  }

  private filterListingData(
    data: Partial<CreateFormDto>,
    isPreoccupiedSpecialType: boolean,
  ): Prisma.ListingCreateInput {
    const validFields = [
      'title',
      'description',
      'price',
      'bedrooms',
      'bathrooms',
      'propertyType',
      'furnishing',
      'amenities',
      'features',
      'preferredTenant',
      'preferredGender',
      'isPreoccupied',
      'isActive',
      'configuration',
      'mainImage',
      'photos',
    ];

    if (isPreoccupiedSpecialType) {
      validFields.push(
        'roomFurnishingItems',
        'houseFurnishingItems',
        'maidChargesPerPerson',
        'cookChargesPerPerson',
        'wifiChargesPerPerson',
        'otherMaintenanceCharges',
        'otherMaintenanceDetails',
      );
    }

    const filteredData = Object.entries(data)
      .filter(([key]) => validFields.includes(key))
      .reduce((obj, [key, value]) => {
        if (Array.isArray(value)) {
          return { ...obj, [key]: { set: value } };
        }
        return { ...obj, [key]: value };
      }, {});

    return filteredData as Prisma.ListingCreateInput;
  }

  private async createLocationInTransaction(
    location: LocationDto,
    prisma: Prisma.TransactionClient,
  ) {
    const existingLocation = await prisma.location.findFirst({
      where: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    });

    if (existingLocation) {
      return existingLocation;
    }

    return prisma.location.create({
      data: location,
    });
  }

  private async createOccupants(
    prisma: Prisma.TransactionClient,
    occupants: OccupantDto[],
    listingId: string,
  ) {
    await Promise.all(
      occupants.map((occupant) =>
        prisma.occupant.create({
          data: {
            ...occupant,
            listing: { connect: { id: listingId } },
          },
        }),
      ),
    );
  }

  async fetchListingWithDetails(
    prisma: Prisma.TransactionClient,
    listingId: string,
  ) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        location: true,
        Occupant: true,
        broker: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        metroStations: {
          include: {
            metroStation: true,
          },
          orderBy: {
            distanceInKm: 'asc',
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException(`Listing #${listingId} not found`);
    }

    const formattedMetroStations =
      listing.metroStations?.map((relation) => ({
        id: relation.metroStation.id,
        name: relation.metroStation.name,
        line: relation.metroStation.line,
        distanceInKm: relation.distanceInKm,
      })) || [];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { metroStations, ...listingWithoutMetroStations } = listing;

    return {
      ...listingWithoutMetroStations,
      nearbyMetroStations: formattedMetroStations,
    };
  }
}
