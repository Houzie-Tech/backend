# Form Module Documentation

## Overview

The Form Module in the Houzie application provides comprehensive functionality for managing real estate property listings. It handles the creation, retrieval, updating, and deletion of property listings, along with advanced search capabilities, AI-powered property descriptions, and metro station proximity features.

## Features

### Property Listing Management

1. **Create Listings**
   - Support for various property types (FLAT_APARTMENT, VILLA, CO_LIVING, PG, etc.)
   - Detailed property specifications (bedrooms, bathrooms, amenities, etc.)
   - Location information with geographical coordinates
   - Pre-occupied property handling with current occupant details
   - [Learn more about creating listings](../forms/create_property.doc.md)

2. **Search and Filter**
   - Price range filtering
   - Property specifications filtering (bedrooms, bathrooms)
   - Property type filtering
   - Location-based search with distance calculations
   - Amenities and features filtering
   - Tenant preference filtering
   - Pagination and sorting options
   - Progressive filter relaxation when no results are found
   - [Learn more about search Listings](../forms/findproperties.docs.md)

3. **AI-Enhanced Descriptions**
   - Personalized property descriptions based on user preferences
   - Analysis of user's favorite and visited listings
   - Compelling and relevant property highlights
   - Integration with OpenAI's GPT models
   - [Learn more about AI Enhanced Description](../forms/ai_description.docs.md)

4. **Metro Station Integration**
   - Find properties near specific metro stations
   - Distance-based filtering from metro stations
   - Walking time estimates to nearby stations
   - [Learn more about Metro Station Intergation with Lisitng creation](../forms/listing_metro_service.doc.md).

### Transaction Management

- Database transactions for ensuring data consistency
- Error handling with appropriate exception types
- Optimistic concurrency control with serializable isolation level

## Implementation Details

### Module Structure

The Form Module is composed of:

1. **FormController**: Handles HTTP requests for property listing endpoints
2. **FormService**: Implements business logic for listing management
3. **ListingCreator**: Specialized service for creating new listings
4. **ListingMetroService**: Manages relationships between listings and metro stations
5. **DTOs**: Structured data transfer objects for validation and type safety
6. **AI Utilities**: Helper functions for generating AI-powered descriptions

### Property Listing Flow

#### Creating a Listing

1. User submits property details via the API
2. System validates the input data through DTO
3. Transaction is initiated with serializable isolation level
4. ListingCreator service handles the creation process:
   - Location data is created or reused if it exists
   - Property listing is created with all related information
   - For pre-occupied properties, occupant details are stored
5. ListingMetroService creates relationships with nearby metro stations
6. Complete listing with all related data is returned

#### Searching for Properties

1. User provides search criteria through PropertySearchDto
2. System applies database-level filtering with dynamic where clauses
3. Distance calculations are performed for location-based searches using the Haversine formula
4. If no results are found, filters are progressively relaxed in two stages:
   - First removing array-based filters (amenities, features, preferredGender)
   - Then falling back to minimal filtering (isActive only)
5. Results are paginated and sorted according to preferences
6. Metro station information is included with each listing

#### AI-Powered Descriptions

1. When a user views a listing with AI description enabled (descriptionAi flag)
2. System retrieves user's favorite and visited listings
3. Property details are formatted into a structured prompt
4. OpenAI's GPT model generates a personalized description
5. Description is returned with the listing details

### Security Considerations

- Role-based access control for listing management using @Roles decorator
- JWT authentication using AuthGuard
- User ownership verification for updates and deletions
- Input validation for all endpoints through DTOs
- Error handling with appropriate HTTP status codes and messages

## API Endpoints

| Endpoint | Method | Description | Access Control |
|----------|--------|-------------|---------------|
| `/listings` | POST | Create a new property listing | BROKER role |
| `/listings` | GET | Search and filter property listings | Public |
| `/listings/:id` | GET | Get details of a specific listing | Public |
| `/listings/:id` | PATCH | Update a property listing | BROKER role, owner only |
| `/listings/:id` | DELETE | Delete a property listing | BROKER role, owner only |
| `/listings/near-metro/:metroStationId` | GET | Find properties near a specific metro station | Public |

## Integration with Other Modules

The Form Module integrates with:

1. **AuthModule**: For authentication and authorization
2. **PrismaModule**: For database operations
3. **MetroStationModule**: For metro station proximity features
4. **OpenAI SDK**: For AI-powered description generation

## Why These Choices?

1. **Transaction-based Operations**: Ensures data consistency across related tables with a 10-second timeout and serializable isolation
2. **Progressive Filter Relaxation**: Improves user experience by providing relevant results even when exact matches aren't found
3. **Haversine Formula for Distance Calculation**: Provides accurate distance measurements for location-based searches
4. **AI-Powered Descriptions**: Enhances property listings with personalized, compelling descriptions
5. **Role-based Access Control**: Ensures only authorized users can create and manage listings
6. **Metro Station Integration**: Adds valuable location context for urban property searches
7. **Service Decomposition**: Separates concerns with specialized services for creation and metro station handling
