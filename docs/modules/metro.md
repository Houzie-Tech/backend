# MetroStationService Overview

The `MetroStationService` is a core service in the Houzie backend responsible for managing metro station data within the application. This service handles CRUD operations for metro stations and provides specialized functionality for location-based queries.

## Key Features

**Basic CRUD Operations**

- Create new metro station records
- Update existing metro station information
- Remove metro station entries
- Retrieve metro station data

**Specialized Functionality**

- Find nearby metro stations based on geographical coordinates
- Calculate distances between locations using the Haversine formula
- Filter stations within a specified radius

## Implementation Details

The service is implemented as an injectable NestJS service with the following components:

- **Constructor**: Injects the PrismaService for database operations
- **Data Operations**: Leverages Prisma ORM for efficient database interactions
- **Geospatial Functions**: Implements proximity search using the imported `calculateDistance` utility

**Core Methods**:

- `create()`: Creates a new metro station with default city set to 'Gurgaon'
- `findAll()`: Retrieves all metro stations for Gurgaon
- `findOne()`: Retrieves a specific metro station by ID
- `update()`: Updates metro station information
- `remove()`: Deletes a metro station record
- `findNearbyMetroStations()`: Finds stations within a specified radius (default 5km)

## Data Structure

The service works with metro station data that includes:

- Basic information (name, ID, etc.)
- Geographic coordinates (latitude, longitude)
- City information (defaulting to Gurgaon)

## Usage Examples

This service can be injected into controllers or other services:

```typescript
// Example usage in a controller
constructor(private metroStationService: MetroStationService) {}

@Get('nearby')
async getNearbyStations(
  @Query('lat') latitude: number,
  @Query('lng') longitude: number,
  @Query('radius') radius?: number
) {
  return this.metroStationService.findNearbyMetroStations(
    latitude, 
    longitude,
    radius
  );
}
```

The nearby stations functionality returns stations with calculated distances, making it useful for proximity-based features in the application.
