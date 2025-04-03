# Profile Module Overview

The Profile module in the Houzie backend handles user profile management and user interactions with property listings, including favorites and browsing history tracking. This module provides a comprehensive set of features that enhance the personalized experience for users on the platform.

## Core Functionality

The Profile module offers the following key capabilities:

- **Profile Management**: View and update user profile information
- **Favorites Management**: Add, remove, and retrieve favorite property listings
- **Browsing History**: Track and retrieve visited property listings
- **User Preferences**: Store and manage user preferences related to property search

## Key Components

### Controller

The ProfileController exposes RESTful endpoints for profile-related operations, including profile management, favorites, and visited listings. All endpoints are protected by the AuthGuard to ensure security.

```typescript
@Controller('profile')
export class ProfileController {
  // Profile management endpoints
  @Get('')                // Get user profile
  @Patch('')              // Update user profile
  @Delete(':id')          // Delete profile (placeholder implementation)
  
  // Favorites management endpoints
  @Post('favorites/:listingId')     // Add listing to favorites
  @Delete('favorites/:listingId')   // Remove listing from favorites
  @Get('favorites')                 // Get all favorite listings
  
  // Visited listings endpoints
  @Post('visited/:listingId')       // Mark listing as visited
  @Get('visited')                   // Get all visited listings
}
```

### Service

The ProfileService implements the business logic for profile operations:

- Retrieving user profile data with selective field exposure
- Updating profile information
- Managing favorite listings with duplicate prevention
- Tracking property viewing history with timestamps
- Handling related error scenarios appropriately

## API Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/profile` | Retrieve user profile | Required |
| PATCH | `/profile` | Update user profile | Required |
| DELETE | `/profile/:id` | Delete user profile (placeholder) | Required |
| POST | `/profile/favorites/:listingId` | Add listing to favorites | Required |
| DELETE | `/profile/favorites/:listingId` | Remove listing from favorites | Required |
| GET | `/profile/favorites` | Get all favorite listings | Required |
| POST | `/profile/visited/:listingId` | Mark listing as visited | Required |
| GET | `/profile/visited` | Get all visited listings | Required |

## Features

### Profile Management

The module provides capabilities to view and update user profile information:

- **Profile Retrieval**: Securely fetches user profile data, exposing only necessary fields (id, email, name, phone number, role, etc.)
- **Profile Updates**: Allows users to update specific profile fields (name, Aadhar number, company name)

### Favorites Management

Users can maintain a collection of favorite property listings:

- **Add to Favorites**: Users can mark listings as favorites for later reference
- **Remove from Favorites**: Users can remove listings from their favorites list
- **Retrieve Favorites**: Users can view all their favorite listings with complete property details

Key aspects:

- Prevents duplicate favorites through uniqueness constraints
- Validates listing existence before adding to favorites
- Returns detailed listing information including location data

### Browsing History

The module tracks user interactions with property listings:

- **Visit Tracking**: Records when a user views a property listing
- **History Retrieval**: Retrieves the user's browsing history in reverse chronological order

Key aspects:

- Automatically updates timestamps when a listing is revisited
- Stores complete property details including location information
- Orders history with most recently visited listings first

## Data Model

The Profile module interacts with several database entities:

### User Entity

- Basic profile information (id, email, name, phone)
- Identity verification (Aadhar number)
- Professional details (company name, role)
- Timestamps (created, updated)

### FavoriteListing Entity

- Composite key of userId and listingId
- References to User and Listing entities
- Timestamp for when the listing was favorited

### VisitedListing Entity

- Composite key of userId and listingId
- References to User and Listing entities
- Visit timestamp that updates on revisits

## Error Handling

The service implements comprehensive error handling:

- **NotFoundException**: When profiles, listings, or favorites are not found
- **ConflictException**: When attempting to add a duplicate favorite
- **Generic Error Handling**: For database or other unexpected errors

## Security Considerations

The Profile module maintains strong security practices:

- **Authentication**: All endpoints are protected by JWT authentication
- **User Data Isolation**: Users can only access and modify their own profile data
- **Selective Data Exposure**: Profile retrieval excludes sensitive fields
- **Input Validation**: All input data is validated before processing

## Integration Points

The Profile module integrates with:

- **Auth Module**: For authentication and user identification
- **Listing Module**: For property data referenced in favorites and history
- **Location Module**: For location data associated with property listings

This module provides essential functionality for personalizing the user experience on the Houzie platform while maintaining proper security and data isolation principles.
