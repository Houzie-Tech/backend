import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { calculateDistance } from 'src/utils/distance.utils';

@Injectable()
export class ListingMetroService {
  async createMetroStationRelations(
    prisma: Prisma.TransactionClient,
    listingId: string,
    locationDetails: { latitude: number; longitude: number },
  ) {
    const metroStations = await this.fetchGurgaonMetroStations(prisma);
    await this.createListingMetroStationRecords(
      prisma,
      listingId,
      locationDetails,
      metroStations,
    );
  }

  private async fetchGurgaonMetroStations(prisma: Prisma.TransactionClient) {
    return prisma.metroStation.findMany({
      where: { city: 'Gurgaon' },
    });
  }

  private async createListingMetroStationRecords(
    prisma: Prisma.TransactionClient,
    listingId: string,
    locationDetails: { latitude: number; longitude: number },
    metroStations: any[],
  ) {
    await Promise.all(
      metroStations.map((station) => {
        const distanceInKm = calculateDistance(
          locationDetails.latitude,
          locationDetails.longitude,
          station.latitude,
          station.longitude,
        );

        return prisma.listingMetroStation.create({
          data: {
            listingId,
            metroStationId: station.id,
            distanceInKm,
          },
        });
      }),
    );
  }
}
