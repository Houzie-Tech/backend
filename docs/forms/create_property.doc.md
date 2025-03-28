# ListingCreator Service Documentation

## Overview

The `ListingCreator` service is a specialized component of the Form Module in the Houzie application, responsible for handling the creation of property listings with their associated data. This service encapsulates the complex logic required to create listings with locations, occupant details, and metro station relationships.

## Key Features

- Transaction-based listing creation
- Location data management (create or reuse)
- Special handling for pre-occupied properties
- Occupant data management
- Metro station relationship handling
- Comprehensive listing data retrieval

## Implementation Details

### Service Structure

The `ListingCreator` service is injected into the `FormService` and works with the Prisma transaction client to ensure data consistency:

```typescript
@Injectable()
export class ListingCreator {
  // Methods for creating and retrieving listings
}
```

### Main Methods

#### createListing

```typescript
async createListing(
  prisma: Prisma.TransactionClient,
  createFormDto: CreateFormDto,
  brokerId: string,
): Promise
```

This method is the entry point for listing creation and:

- Extracts location and occupant data from the DTO
- Creates or finds the location record
- Determines if the property is a special pre-occupied type
- Creates the listing record
- Handles occupant data for pre-occupied properties
- Returns the complete listing with location data

#### isPreoccupiedSpecialPropertyType

```typescript
private isPreoccupiedSpecialPropertyType(
  listingDetails: Partial,
): boolean
```

Determines if a property is a special pre-occupied type that requires additional fields:

- Checks if the property is marked as pre-occupied
- Verifies if the property type is one of: VILLA, BUILDER_FLOOR, or FLAT_APARTMENT

#### createListingRecord

```typescript
private async createListingRecord(
  prisma: Prisma.TransactionClient,
  listingDetails: Partial,
  locationId: string,
  brokerId: string,
  isPreoccupiedSpecialType: boolean,
): Promise
```

Creates the actual listing record in the database:

- Filters the listing data based on valid fields
- Creates the listing with relationships to location and broker
- Returns the created listing

#### filterListingData

```typescript
private filterListingData(
  data: Partial,
  isPreoccupiedSpecialType: boolean,
): Prisma.ListingCreateInput
```

Filters and formats the listing data for database insertion:

- Defines valid fields for all listings
- Adds special fields for pre-occupied properties if needed
- Handles array fields properly by using Prisma's `set` operator
- Returns a properly formatted Prisma input object

#### createLocationInTransaction

```typescript
private async createLocationInTransaction(
  location: LocationDto,
  prisma: Prisma.TransactionClient,
)
```

Creates or finds a location record:

- Checks if a location with the same coordinates already exists
- Returns the existing location if found
- Creates a new location record if not found

#### createOccupants

```typescript
private async createOccupants(
  prisma: Prisma.TransactionClient,
  occupants: OccupantDto[],
  listingId: string,
)
```

Creates occupant records for pre-occupied properties:

- Uses Promise.all for efficient parallel creation
- Creates each occupant with a relationship to the listing

#### fetchListingWithDetails

```typescript
async fetchListingWithDetails(
  prisma: Prisma.TransactionClient,
  listingId: string,
)
```

Retrieves a listing with all its related data:

- Fetches the listing with location, occupants, broker, and metro stations
- Formats metro station data for easier consumption
- Throws a NotFoundException if the listing is not found
- Returns a formatted listing object with all related data

## Usage Example

The `ListingCreator` service is used within the `FormService` during the listing creation process:

```typescript
// In FormService.create method
const listing = await this.listingCreator.createListing(
  prisma,
  createFormDto,
  brokerId,
);

// After creating metro station relations
return this.listingCreator.fetchListingWithDetails(
  prisma,
  listing.id,
);
```

## Error Handling

The service implements proper error handling:

- Throws `InternalServerErrorException` for location creation failures
- Throws `NotFoundException` when a listing cannot be found
- Uses try-catch blocks in the calling service to handle other exceptions

## Integration Points

The `ListingCreator` service integrates with:

1. **Prisma Transaction Client**: For database operations within a transaction
2. **CreateFormDto**: For input data validation and structure
3. **LocationDto**: For location data structure
4. **OccupantDto**: For occupant data structure
5. **Metro Station Relations**: Through the calling service

## Maintenance Notes

When updating this service, consider:

1. **Transaction Isolation**: Maintain the transaction-based approach for data consistency
2. **Field Validation**: Update the valid fields list when adding new listing properties
3. **Special Property Types**: Update special property type handling when adding new types
4. **Error Handling**: Maintain proper error handling and propagation
5. **Documentation**: Update this documentation when making significant changes
