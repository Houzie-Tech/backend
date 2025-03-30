# Description Generator Service Documentation

## Overview

The `DescriptionGeneratorService` is a core component of the Houzie backend that creates personalized property descriptions for users based on their preferences and property characteristics. This service dynamically generates tailored descriptions that highlight the features of a property that match a user's preferences, enhancing the user experience by providing relevant information.

## Dependencies

The service relies on two primary dependencies:

- `PrismaService`: Handles database operations to retrieve property listings and related data
- `PreferenceCalculatorService`: Calculates and provides user preferences based on their behavior and explicit settings

## Core Functionality

### generatePersonalizedDescription

```typescript
async generatePersonalizedDescription(
  userId: string,
  listingId: string
): Promise
```

This is the main method exposed by the service. It takes a user ID and a listing ID as parameters and returns a personalized property description as a string.

**Process Flow:**

1. Retrieves user preferences using the PreferenceCalculatorService
2. Fetches the listing details from the database using PrismaService
3. Matches user preferences with listing features
4. Constructs a personalized description highlighting matched features

### Helper Methods

#### matchPreferencesToListing

```typescript
private matchPreferencesToListing(userPreferences: any, listing: any)
```

Compares user preferences with listing attributes and identifies matches. The method:

- Sorts preferences by weight (importance to the user)
- Checks if the listing matches the user's top preferences across categories:
  - Property type
  - Price range
  - Location
  - Amenities
- Returns up to 5 highest-weighted matches with appropriate messaging

#### constructDescription

```typescript
private constructDescription(listing: any, matchedFeatures: any[]): string
```

Builds the final description text by combining:

- Basic property information (title, type, configuration, location)
- Standard details (bedrooms, bathrooms, balconies)
- Personalized section highlighting features that match user preferences

#### Formatting Methods

The service includes several helper methods to format different property attributes:

- `formatPropertyType`: Converts property type codes to user-friendly text
- `formatConfiguration`: Formats property configuration codes (1BHK, 2BHK, etc.)
- `formatAmenity`: Converts amenity codes to descriptive text
- `getPriceRange`: Categorizes a numeric price into a descriptive range (budget, affordable, etc.)

## Data Models

### Input Parameters

- `userId`: String identifier for the user
- `listingId`: String identifier for the property listing

### Listing Object

The service expects a listing object with the following structure:

- `id`: Unique identifier
- `title`: Property title
- `propertyType`: Type of property (FLAT_APARTMENT, VILLA, etc.)
- `configuration`: Layout configuration (ONE_BHK, TWO_BHK, etc.)
- `price`: Numeric price value
- `bedrooms`: Number of bedrooms
- `bathrooms`: Number of bathrooms
- `balconies`: Number of balconies
- `amenities`: Array of amenity codes
- `location`: Object containing location details including `city`

### User Preferences

The service works with user preferences in the following format:

- `weights`: Array of preference objects, each containing:
  - `featureId`: String in format "type:value"
  - `weight`: Numeric weight indicating importance

## Error Handling

The service throws an error if the requested listing is not found in the database.

## Usage Example

```typescript
// Instantiate the service
const descriptionGenerator = new DescriptionGeneratorService(
  prismaService,
  preferenceCalculatorService
);

// Generate a personalized description
const description = await descriptionGenerator.generatePersonalizedDescription(
  'user123',
  'listing456'
);

// Use the generated description
console.log(description);
```
