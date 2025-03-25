import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMetroStationDto } from './dto/create-metro-station.dto';
import { UpdateMetroStationDto } from './dto/update-metro-station.dto';
import { calculateDistance } from 'src/utils/distance.utils';

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
      const distance = calculateDistance(
        latitude,
        longitude,
        station.latitude,
        station.longitude,
      );
      return distance <= maxDistance;
    });
    return nearbyStations.map((station) => {
      const distance = calculateDistance(
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
}
