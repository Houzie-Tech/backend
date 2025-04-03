# Preference Calculator Service Documentation

## Overview

The Preference Calculator Service analyzes user behavior to determine property preferences through weighted feature analysis. It processes user interactions (favorites and property views) to generate dynamic preference profiles used for personalized recommendations.

## Core Functionality

- **Behavior Tracking**: Analyzes favorite listings and property visit history
- **Feature Weighting**: Calculates preference scores for 7 key property characteristics
- **Recency Adjustment**: Prioritizes recent interactions in scoring
- **Price Bracket Analysis**: Groups prices into logical ranges for preference matching

## Technical Architecture

### Main Components

#### 1. Preference Calculation Workflow

```typescript
async calculateUserPreferences(userId: string): Promise {
  // 1. Fetch user interaction data
  // 2. Process favorites and visits
  // 3. Generate weighted feature scores
  // 4. Return compiled preference profile
}
```

#### 2. Feature Processing Matrix

| Feature Category | Example Values | Weight Source |
|------------------|----------------|---------------|
| Property Type | `APARTMENT`, `VILLA` | Listing.propertyType |
| Price Range | `luxury`, `mid-range` | Derived from price |
| Location | Location IDs | Listing.locationId |
| Configuration | `2BHK`, `3BHK` | Listing.configuration |
| Amenities | `POOL`, `GYM` | Listing.amenities array |
| Features | `SEA_VIEW`, `PARKING` | Listing.features array |
| Furnishing | `FULLY_FURNISHED` | Listing.furnishing |

### Weighting Algorithm

#### Interaction Type Weights

| Interaction Type | Base Weight | Recency Adjustment |
|------------------|-------------|--------------------|
| Favorites | 0.8 | None |
| Visits | 0.4 | Linear decay (0.05 per position) |

**Recency Calculation**:

```typescript
const recencyFactor = Math.max(0.3, 1 - i * 0.05); // Recent visits get higher weights
```

#### Price Bracket Logic

```typescript
private getPriceRange(price: number): string {
  if (price ,
  featureId: string,
  weight: number
) {
  // Creates or updates feature weight entry
  weights[featureId] = {
    featureId,
    weight: (weights[featureId]?.weight || 0) + weight,
    interactionCount: (weights[featureId]?.interactionCount || 0) + 1,
    lastInteraction: new Date()
  };
}
```

### 2. Interaction Processing

```typescript
private processListingFeatures(
  listing: any,
  weights: Record,
  baseWeight: number
) {
  // Processes 7 feature categories
  // Updates weights for each relevant feature
}
```

## Integration Points

1. **Prisma Service**: Accesses user interaction data
2. **Listing Service**: Requires normalized listing features
3. **Recommendation Engine**: Consumes preference weights
4. **User Service**: Links to user profile data

## Performance Considerations

- **Caching**: Implement Redis caching for computed preferences
- **Batch Processing**: Run nightly updates for active users
- **Indexing**: Ensure database indexes on:
  - `favoriteListing(userId)`
  - `visitedListing(userId)`
  - `listing(price,propertyType)`

## Example Output

```json
{
  "userId": "usr_abcd1234",
  "lastUpdated": "2024-03-15T08:32:45Z",
  "weights": [
    {
      "featureId": "propertyType:APARTMENT",
      "weight": 2.8,
      "interactionCount": 4,
      "lastInteraction": "2024-03-14T15:22:10Z"
    },
    {
      "featureId": "priceRange:premium",
      "weight": 1.9,
      "interactionCount": 3,
      "lastInteraction": "2024-03-14T18:45:21Z"
    },
    {
      "featureId": "amenity:SWIMMING_POOL",
      "weight": 1.2,
      "interactionCount": 2,
      "lastInteraction": "2024-03-13T09:12:34Z"
    }
  ]
}
```

## Usage Pattern

```typescript
// Get preferences for recommendations
const preferences = await preferenceCalculatorService
  .calculateUserPreferences(userId);

// Use in recommendation engine
const recommendations = recommendationService
  .getSuggestions(preferences.weights);
```