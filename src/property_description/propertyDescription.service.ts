import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PreferenceCalculatorService } from 'src/user_preference/preferenceCalculator.service';

@Injectable()
export class DescriptionGeneratorService {
  constructor(
    private prisma: PrismaService,
    private preferenceCalculator: PreferenceCalculatorService,
  ) {}

  async generatePersonalizedDescription(
    userId: string,
    listingId: string,
  ): Promise<string> {
    // Get user preferences
    const userPreferences =
      await this.preferenceCalculator.calculateUserPreferences(userId);

    // Get current listing details
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        location: true,
      },
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    // Match user preferences with current listing
    const matchedFeatures = this.matchPreferencesToListing(
      userPreferences,
      listing,
    );

    // Generate description based on matches
    return this.constructDescription(listing, matchedFeatures);
  }

  private matchPreferencesToListing(userPreferences: any, listing: any) {
    const matchedFeatures = [];
    const sortedPreferences = userPreferences.weights.sort(
      (a, b) => b.weight - a.weight,
    );

    // Check top preferences against listing
    for (const pref of sortedPreferences) {
      const [type, value] = pref.featureId.split(':');

      switch (type) {
        case 'propertyType':
          if (listing.propertyType === value) {
            matchedFeatures.push({
              type: 'propertyType',
              value,
              weight: pref.weight,
              message: `This ${this.formatPropertyType(value)} matches your preferred property type.`,
            });
          }
          break;

        case 'priceRange':
          const listingPriceRange = this.getPriceRange(listing.price);
          if (listingPriceRange === value) {
            matchedFeatures.push({
              type: 'priceRange',
              value,
              weight: pref.weight,
              message: `This property is in your preferred price range.`,
            });
          }
          break;

        case 'location':
          if (listing.locationId === value) {
            matchedFeatures.push({
              type: 'location',
              value,
              weight: pref.weight,
              message: `Located in ${listing.location.city}, an area you've shown interest in.`,
            });
          }
          break;

        case 'amenity':
          if (listing.amenities && listing.amenities.includes(value)) {
            matchedFeatures.push({
              type: 'amenity',
              value,
              weight: pref.weight,
              message: `Features ${this.formatAmenity(value)}, which you often look for.`,
            });
          }
          break;
      }
    }

    return matchedFeatures.slice(0, 5); // Return top 5 matches
  }

  private constructDescription(listing: any, matchedFeatures: any[]): string {
    // Basic description
    let description = `${listing.title} - A ${this.formatPropertyType(listing.propertyType)} `;

    if (listing.configuration) {
      description += `with ${this.formatConfiguration(listing.configuration)} `;
    }

    description += `in ${listing.location.city}.\n\n`;

    // Add standard details
    description += `This property offers ${listing.bedrooms || 0} bedroom(s) and ${listing.bathrooms || 0} bathroom(s)`;

    if (listing.balconies) {
      description += ` with ${listing.balconies} balcony/balconies`;
    }

    description += `. `;

    // Add personalized section if matches found
    if (matchedFeatures.length > 0) {
      description += `\n\nBased on your preferences:\n`;

      for (const feature of matchedFeatures) {
        description += `- ${feature.message}\n`;
      }
    }

    return description;
  }

  private formatPropertyType(type: string): string {
    const formats = {
      INDEPENDENT_HOUSE: 'independent house',
      VILLA: 'villa',
      PLOT: 'plot',
      BUILDER_FLOOR: 'builder floor',
      FLAT_APARTMENT: 'apartment',
      CO_LIVING: 'co-living space',
      PG: 'paying guest accommodation',
    };

    return formats[type] || type.toLowerCase().replace('_', ' ');
  }

  private formatConfiguration(config: string): string {
    const formats = {
      ONE_RK: '1 RK',
      ONE_BHK: '1 BHK',
      TWO_BHK: '2 BHK',
      THREE_BHK: '3 BHK',
      FOUR_BHK: '4 BHK',
      FOUR_PLUS_BHK: '4+ BHK',
    };

    return formats[config] || config;
  }

  private formatAmenity(amenity: string): string {
    const formats = {
      WIFI: 'WiFi connectivity',
      TWO_WHEELER_PARKING: 'two-wheeler parking',
      FOUR_WHEELER_PARKING: 'four-wheeler parking',
      WATER_SUPPLY_24_7: '24/7 water supply',
      POWER_BACKUP: 'power backup',
      SECURITY_24_7: '24/7 security',
      CCTV: 'CCTV surveillance',
      DAILY_HOUSEKEEPING: 'daily housekeeping',
      MEALS: 'meal service',
      GYM: 'gym access',
      BALCONY: 'a balcony',
    };

    return formats[amenity] || amenity.toLowerCase().replace('_', ' ');
  }

  private getPriceRange(price: number): string {
    if (price < 5000) return 'budget';
    if (price < 10000) return 'affordable';
    if (price < 20000) return 'mid-range';
    if (price < 40000) return 'premium';
    return 'luxury';
  }
}
