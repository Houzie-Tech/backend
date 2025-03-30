# Description Generator Module Documentation

## Overview

The Description Generator module is a specialized component of the Houzie backend that creates personalized property descriptions for users based on their preferences and property characteristics. This module enhances the user experience by highlighting property features that align with individual user preferences, making property listings more relevant and engaging.

## Architecture

The module consists of two main components:

1. **DescriptionGeneratorService**: Core service that handles the business logic for generating personalized property descriptions
2. **DescriptionController**: REST API controller that exposes the description generation functionality via HTTP endpoints

## Controller

The `DescriptionController` provides a RESTful interface to access the description generation functionality:

```typescript
@Controller('descriptions')
export class DescriptionController {
  constructor(private descriptionGenerator: DescriptionGeneratorService) {}

  @UseGuards(AuthGuard)
  @Get(':listingId')
  async getPersonalizedDescription(
    @User() user,
    @Param('listingId') listingId: string,
  ) {
    const description =
      await this.descriptionGenerator.generatePersonalizedDescription(
        user.id,
        listingId,
      );

    return { description };
  }
}
```

### Endpoints

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/descriptions/:listingId` | GET | Retrieves a personalized description for a specific property listing | Required |

### Security

- The controller uses `AuthGuard` to ensure that only authenticated users can access the personalized descriptions
- User information is extracted from the JWT token using the `@User()` decorator

## Service

The `DescriptionGeneratorService` handles the core logic for generating personalized property descriptions:

### Dependencies

- `PrismaService`: Database access layer for retrieving property listings
- `PreferenceCalculatorService`: Service for calculating user preferences

### Key Methods

#### generatePersonalizedDescription

```typescript
async generatePersonalizedDescription(
  userId: string,
  listingId: string
): Promise
```

Main method that orchestrates the description generation process:

1. Retrieves user preferences
2. Fetches listing details
3. Matches preferences to listing features
4. Constructs a personalized description

#### Helper Methods

- `matchPreferencesToListing`: Identifies listing features that match user preferences
- `constructDescription`: Builds the final description text
- Various formatting methods for property attributes (property types, configurations, amenities)

## Data Flow

1. Client makes an authenticated GET request to `/descriptions/:listingId`
2. Controller extracts user ID from the authentication token
3. Service retrieves user preferences using PreferenceCalculatorService
4. Service fetches listing details from the database
5. Service matches user preferences with listing features
6. Service constructs a personalized description
7. Controller returns the description to the client

## Error Handling

- If the requested listing is not found, the service throws an error
- Authentication failures are handled by the AuthGuard

## Integration Points

- **Authentication System**: Relies on the auth module for user authentication
- **User Preferences**: Integrates with the user preference calculation system
- **Database**: Uses Prisma ORM to access listing data

## Usage Example

```typescript
// Client-side code
async function getPropertyDescription(listingId) {
  const response = await fetch(`/api/descriptions/${listingId}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  const data = await response.json();
  return data.description;
}
```
