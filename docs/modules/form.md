# Form Module Documentation

## Overview

The Form Module in the Houzie application provides comprehensive functionality for managing real estate property listings. It handles the creation, retrieval, updating, and deletion of property listings, along with advanced search capabilities and AI-powered property descriptions.

## Features

### Property Listing Management

1. **Create Listings**
   - Support for various property types (FLAT_APARTMENT, VILLA, CO_LIVING, PG, etc.)
   - Detailed property specifications (bedrooms, bathrooms, amenities, etc.)
   - Location information with geographical coordinates
   - Pre-occupied property handling with current occupant details

2. **Search and Filter**
   - Price range filtering
   - Property specifications filtering (bedrooms, bathrooms)
   - Property type filtering
   - Location-based search with distance calculations
   - Amenities and features filtering
   - Tenant preference filtering
   - Pagination and sorting options

3. **AI-Enhanced Descriptions**
   - Personalized property descriptions based on user preferences
   - Analysis of user's favorite and visited listings
   - Compelling and relevant property highlights
   - Integration with OpenAI's GPT models

### Transaction Management

- Database transactions for ensuring data consistency
- Error handling with appropriate exception types
- Optimistic concurrency control

## Implementation Details

### Module Structure

The Form Module is composed of:

1. **FormController**: Handles HTTP requests for property listing endpoints
2. **FormService**: Implements business logic for listing management
3. **DTOs**: Structured data transfer objects for validation and type safety
4. **AI Utilities**: Helper functions for generating AI-powered descriptions

### Property Listing Flow

#### Creating a Listing

1. User submits property details via the API
2. System validates the input data
3. Location data is created or reused if it exists
4. Property listing is created with all related information
5. For pre-occupied properties, occupant details are stored
6. Transaction ensures all-or-nothing operations

#### Searching for Properties

1. User provides search criteria
2. System applies database-level filtering
3. Distance calculations are performed for location-based searches
4. If no results are found, filters are progressively relaxed
5. Results are paginated and sorted according to preferences

#### AI-Powered Descriptions

1. When a user views a listing with AI description enabled
2. System analyzes user's favorite and visited listings
3. Property details are formatted into a structured prompt
4. OpenAI's GPT model generates a personalized description
5. Description is returned with the listing details

### Security Considerations

- Role-based access control for listing management
- User ownership verification for updates and deletions
- Input validation for all endpoints
- Error handling with appropriate HTTP status codes

## API Endpoints

| Endpoint | Method | Description | Access Control |
|----------|--------|-------------|---------------|
| `/listings` | POST | Create a new property listing | BROKER role |
| `/listings` | GET | Search and filter property listings | Public |
| `/listings/:id` | GET | Get details of a specific listing | Public |
| `/listings/:id` | PATCH | Update a property listing | BROKER role, owner only |
| `/listings/:id` | DELETE | Delete a property listing | BROKER role, owner only |

## Integration with Other Modules

The Form Module integrates with:

1. **AuthModule**: For authentication and authorization
2. **PrismaModule**: For database operations
3. **OpenAI SDK**: For AI-powered description generation

## Why These Choices?

1. **Transaction-based Operations**: Ensures data consistency across related tables
2. **Progressive Filter Relaxation**: Improves user experience by providing relevant results even when exact matches aren't found
3. **Haversine Formula for Distance Calculation**: Provides accurate distance measurements for location-based searches
4. **AI-Powered Descriptions**: Enhances property listings with personalized, compelling descriptions
5. **Role-based Access Control**: Ensures only authorized users can create and manage listings