import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMetroStationDto } from './dto/create-metro-station.dto';
import { UpdateMetroStationDto } from './dto/update-metro-station.dto';

@Injectable()
export class MetroStationService {
  constructor(private prisma: PrismaService) {}

  async create(createMetroStationDto: CreateMetroStationDto) {
    return this.prisma.metroStation.create({
      data: {
        ...createMetroStationDto,
        city: 'Gurgaon', // Default to Gurgaon
      },
    });
  }

  async findAll() {
    return this.prisma.metroStation.findMany({
      where: {
        city: 'Gurgaon',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.metroStation.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateMetroStationDto: UpdateMetroStationDto) {
    return this.prisma.metroStation.update({
      where: { id },
      data: updateMetroStationDto,
    });
  }

  async remove(id: number) {
    return this.prisma.metroStation.delete({
      where: { id },
    });
  }

  async findNearbyMetroStations(
    latitude: number,
    longitude: number,
    maxDistance: number = 5, // Default 5km radius
  ) {
    // Get all Gurgaon metro stations
    const metroStations = await this.prisma.metroStation.findMany({
      where: {
        city: 'Gurgaon',
      },
    });

    // Calculate distance using Haversine formula
    const nearbyStations = metroStations.filter((station) => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        station.latitude,
        station.longitude,
      );
      return distance <= maxDistance;
    });
    return nearbyStations.map((station) => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        station.latitude,
        station.longitude,
      );
      return {
        ...station,
        distance: parseFloat(distance.toFixed(2)),
      };
    });
  }

  // Haversine formula to calculate distance between two coordinates in kilometers
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth radius in kilometers
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
}
