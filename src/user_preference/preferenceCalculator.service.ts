import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PreferenceWeight,
  UserPreference,
} from './models/preferenceWeights.models';

@Injectable()
export class PreferenceCalculatorService {
  constructor(private prisma: PrismaService) {}

  async calculateUserPreferences(userId: string): Promise<UserPreference> {
    // Fetch user's interaction data
    const favorites = await this.prisma.favoriteListing.findMany({
      where: { userId },
      include: { listing: true },
    });

    const visited = await this.prisma.visitedListing.findMany({
      where: { userId },
      include: { listing: true },
      orderBy: { visitedAt: 'desc' },
    });

    // Initialize preference weights
    const weights: Record<string, PreferenceWeight> = {};

    // Process favorite listings (stronger weight)
    for (const favorite of favorites) {
      this.processListingFeatures(favorite.listing, weights, 0.8);
    }

    // Process visited listings (lower weight, recency matters)
    for (let i = 0; i < visited.length; i++) {
      // More recent visits get higher weights
      const recencyFactor = Math.max(0.3, 1 - i * 0.05);
      this.processListingFeatures(
        visited[i].listing,
        weights,
        0.4 * recencyFactor,
      );
    }

    return {
      userId,
      weights: Object.values(weights),
      lastUpdated: new Date(),
    };
  }

  private processListingFeatures(
    listing: any,
    weights: Record<string, PreferenceWeight>,
    baseWeight: number,
  ) {
    // Process property type
    this.updateFeatureWeight(
      weights,
      `propertyType:${listing.propertyType}`,
      baseWeight,
    );

    // Process price range (create price brackets)
    const priceRange = this.getPriceRange(listing.price);
    this.updateFeatureWeight(weights, `priceRange:${priceRange}`, baseWeight);

    // Process location
    this.updateFeatureWeight(
      weights,
      `location:${listing.locationId}`,
      baseWeight,
    );

    // Process configuration
    if (listing.configuration) {
      this.updateFeatureWeight(
        weights,
        `configuration:${listing.configuration}`,
        baseWeight,
      );
    }

    // Process amenities
    for (const amenity of listing.amenities || []) {
      this.updateFeatureWeight(weights, `amenity:${amenity}`, baseWeight);
    }

    // Process features
    for (const feature of listing.features || []) {
      this.updateFeatureWeight(weights, `feature:${feature}`, baseWeight);
    }

    // Process furnishing
    if (listing.furnishing) {
      this.updateFeatureWeight(
        weights,
        `furnishing:${listing.furnishing}`,
        baseWeight,
      );
    }
  }

  private updateFeatureWeight(
    weights: Record<string, PreferenceWeight>,
    featureId: string,
    weight: number,
  ) {
    if (!weights[featureId]) {
      weights[featureId] = {
        featureId,
        weight: 0,
        interactionCount: 0,
        lastInteraction: new Date(),
      };
    }

    weights[featureId].weight += weight;
    weights[featureId].interactionCount += 1;
    weights[featureId].lastInteraction = new Date();
  }

  private getPriceRange(price: number): string {
    if (price < 5000) return 'budget';
    if (price < 10000) return 'affordable';
    if (price < 20000) return 'mid-range';
    if (price < 40000) return 'premium';
    return 'luxury';
  }
}
