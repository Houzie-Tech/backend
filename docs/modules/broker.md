# Broker Documentation

## Overview

The Broker module provides functionality for managing broker-related operations in the Houzie application. It handles broker profile retrieval, statistics, lead management, and listing operations.

## Features

### Broker Profile Management

- Retrieve broker profile details
- Validate broker existence and role

### Statistics and Analytics

- Get comprehensive broker activity statistics
- Track active and inactive listings
- Monitor active and inactive leads

### Lead Management

- Retrieve active leads associated with a broker
- Access lead contact information and source

### Listing Operations

- Fetch all listings created by a broker
- Toggle AI-generated descriptions for listings

## Implementation Details

### Service Structure

The `BrokerService` is injected with the `PrismaService` for database operations and provides methods for various broker-related functionalities:

```typescript
@Injectable()
export class BrokerService {
  constructor(private prisma: PrismaService) {}
  
  // Service methods...
}
```

### Broker Profile Retrieval

```typescript
async findOne(brokerId: string) {
  // Retrieves broker profile with role validation
}
```

The method fetches broker details while ensuring:

- The user exists in the database
- The user has the BROKER role
- Proper error handling for various scenarios

### Statistics Collection

```typescript
async getStats(brokerId: string) {
  // Collects and returns broker activity statistics
}
```

This method uses Promise.all to efficiently gather multiple statistics in parallel:

- Active listings count
- Inactive listings count
- Active leads count
- Inactive leads count

### Lead Management

```typescript
async getActiveLeads(brokerId: string) {
  // Retrieves active leads for the broker
}
```

Returns all active leads associated with the broker, including:

- Lead identification information
- Contact details (email, phone)
- Lead source information
- Activity status

### Listing Operations

```typescript
async getListingsFromBroker(brokerId: string) {
  // Fetches all listings created by the broker
}
```

Retrieves comprehensive listing information including:

- Basic listing details (title, description)
- Property characteristics (bedrooms, bathrooms, etc.)
- Media content (photos, main image)
- Status and performance metrics (views, active status)

```typescript
async toggleAiDescription(listingId: string, toggle: boolean) {
  // Toggles AI-generated description for a listing
}
```

Enables or disables AI-generated descriptions for a specific listing.

## Error Handling

The service implements robust error handling:

- **Prisma-specific errors**: Handled based on error codes
  - P2025 (Record not found): Converted to NestJS NotFoundException
  - Other Prisma errors: Converted to InternalServerErrorException

- **General error handling**: All unexpected errors are caught and converted to appropriate HTTP exceptions

## Integration Points

The Broker Service integrates with:

1. **PrismaService**: For database operations
2. **User Model**: For broker profile management
3. **Listing Model**: For property listing operations
4. **Lead Model**: For lead management

## Usage Examples

### Retrieving Broker Profile

```typescript
// In a controller or another service
const brokerProfile = await brokerService.findOne('broker-uuid');
```

### Getting Broker Statistics

```typescript
// In a controller or another service
const stats = await brokerService.getStats('broker-uuid');
// Returns: { activeListings, inActiveListings, activeLeads, inActiveLeads }
```

### Fetching Active Leads

```typescript
// In a controller or another service
const activeLeads = await brokerService.getActiveLeads('broker-uuid');
```

### Managing Listings

```typescript
// In a controller or another service
const listings = await brokerService.getListingsFromBroker('broker-uuid');

// Toggle AI description
const result = await brokerService.toggleAiDescription('listing-uuid', true);
```
