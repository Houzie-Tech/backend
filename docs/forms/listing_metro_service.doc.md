# ListingMetroService Documentation

## Overview

The `ListingMetroService` is a specialized service within the Form Module that manages the relationship between property listings and nearby metro stations. It calculates distances between properties and metro stations and creates the necessary database records to represent these relationships.

## Key Features

- Automatic metro station relationship creation for new listings
- Gurgaon metro station data retrieval
- Distance calculation between properties and metro stations
- Bulk creation of listing-metro station relationships

## Implementation Details

### Service Structure

The `ListingMetroService` is injected into the `FormService` and works with the Prisma transaction client to ensure data consistency:

```typescript
@Injectable()
export class ListingMetroService {
  // Methods for creating metro station relations
}
```

### Main Methods

#### createMetroStationRelations

```typescript
async createMetroStationRelations(
  prisma: Prisma.TransactionClient,
  listingId: string,
  locationDetails: { latitude: number; longitude: number },
)
```

This is the primary public method that:

- Fetches all metro stations in Gurgaon
- Creates relationship records between the listing and each metro station
- Calculates the distance from the listing to each metro station

#### fetchGurgaonMetroStations

```typescript
private async fetchGurgaonMetroStations(prisma: Prisma.TransactionClient)
```

A private helper method that:

- Retrieves all metro stations in Gurgaon from the database
- Uses the transaction client to ensure data consistency
- Returns an array of metro station objects

#### createListingMetroStationRecords

```typescript
private async createListingMetroStationRecords(
  prisma: Prisma.TransactionClient,
  listingId: string,
  locationDetails: { latitude: number; longitude: number },
  metroStations: any[],
)
```

A private helper method that:

- Creates relationship records between a listing and multiple metro stations
- Calculates the distance between the listing and each metro station
- Uses Promise.all for efficient parallel creation
- Stores the calculated distance in each relationship record

## Usage Example

The `ListingMetroService` is used within the `FormService` during the listing creation process:

```typescript
// In FormService.create method
await this.listingMetroService.createMetroStationRelations(
  prisma,
  listing.id,
  {
    latitude: listing.location.latitude,
    longitude: listing.location.longitude,
  },
);
```

## Dependencies

The service depends on:

1. **Prisma Transaction Client**: For database operations within a transaction
2. **calculateDistance Utility**: For calculating the distance between two geographical points

## Integration Points

The `ListingMetroService` integrates with:

1. **MetroStation Model**: For retrieving metro station data
2. **ListingMetroStation Model**: For creating relationship records
3. **Listing Model**: Through the listing ID parameter
4. **Distance Utility**: For geographical distance calculations

## Future Enhancements

Potential improvements for the `ListingMetroService`:

1. **Caching Metro Stations**: Implement caching for metro station data to reduce database queries
2. **Walking Time Calculation**: Add walking time estimates based on distance
3. **Metro Line Information**: Include metro line details in the relationship data
4. **City Configuration**: Make the city configurable instead of hardcoding 'Gurgaon'
5. **Distance Threshold**: Add a maximum distance threshold to limit the number of relationships created

## Maintenance Notes

When updating this service, consider:

1. **Transaction Context**: Always maintain the transaction-based approach for data consistency
2. **Distance Calculation**: Ensure the distance calculation utility remains accurate
3. **Metro Station Updates**: Update the service when new metro stations are added to the system
4. **Performance Optimization**: Monitor performance with large numbers of metro stations
5. **Error Handling**: Add more robust error handling for database operations
