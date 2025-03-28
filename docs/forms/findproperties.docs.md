# FormService.findAll Method Documentation

## Overview

The `findAll` method in the FormService provides a sophisticated search and filtering mechanism for property listings in the Houzie application. It supports multiple filter criteria, progressive filter relaxation, distance-based filtering, and pagination.

## Method Signature

```typescript
async findAll(searchParams: PropertySearchDto): Promise & { distance?: number })[];
  metadata: {
    total: number;
    filtered: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}>
```

## Parameters

The method accepts a `PropertySearchDto` object with the following properties:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| minPrice | number | - | Minimum price filter |
| maxPrice | number | - | Maximum price filter |
| minBedrooms | number | - | Minimum number of bedrooms |
| maxBedrooms | number | - | Maximum number of bedrooms |
| minBathrooms | number | - | Minimum number of bathrooms |
| maxBathrooms | number | - | Maximum number of bathrooms |
| propertyType | string[] | - | Array of property types to include |
| latitude | number | - | Latitude for location-based search |
| longitude | number | - | Longitude for location-based search |
| distanceInKm | number | 50 | Maximum distance in kilometers |
| page | number | 1 | Page number for pagination |
| limit | number | 10 | Number of results per page |
| preferredTenant | string | - | Preferred tenant type |
| preferredGender | string[] | - | Array of preferred genders |
| furnishing | string | - | Furnishing type |
| amenities | string[] | - | Array of required amenities |
| features | string[] | - | Array of required features |
| configuration | string | - | Property configuration |
| isActive | boolean | true | Whether to include only active listings |
| sortBy | string | 'createdAt' | Field to sort results by |
| sortOrder | 'asc' \| 'desc' | 'desc' | Sort order |

## Return Value

The method returns a promise that resolves to an object with:

- **data**: Array of listing objects with optional distance property
- **metadata**: Pagination information including:
  - total: Total number of matching records
  - filtered: Number of records after filtering
  - page: Current page number
  - limit: Number of results per page
  - totalPages: Total number of pages

## Implementation Details

### Filter Construction

The method builds a dynamic `where` clause for the Prisma query based on the provided search parameters:

1. **Basic Filters**: isActive, propertyType, preferredTenant, furnishing, configuration
2. **Range Filters**: price, bedrooms, bathrooms
3. **Array Filters**: preferredGender, amenities, features
4. **Location Filter**: Uses a bounding box approach for initial database filtering

### Progressive Filter Relaxation

If no results are found with all filters applied, the method implements a two-stage relaxation strategy:

1. **First Relaxation**: Removes array-based filters (amenities, features, preferredGender)
2. **Second Relaxation**: Falls back to minimal filtering (isActive only)

This approach ensures users always get some results, even if they don't match all criteria.

### Distance Calculation

For location-based searches:

1. Initial filtering uses a bounding box approach for database efficiency
2. Exact distance is calculated using the Haversine formula
3. Results are filtered to include only listings within the specified distance

### Metro Station Integration

The method includes nearby metro stations for each listing:

- Retrieves metro station relationships
- Orders stations by proximity
- Formats the data into a clean structure with station details

## Error Handling

The method uses a centralized error handling approach through the `handleError` method, which:

- Maps Prisma errors to appropriate HTTP exceptions
- Provides specific error messages for different scenarios
- Ensures consistent error responses
