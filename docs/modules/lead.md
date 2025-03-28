# Leads Module Overview

The Leads module is a backend service that manages lead information for real estate brokers. It provides functionality to create, retrieve, update, and delete lead records, as well as filter leads by various criteria including property listings.

## Core Functionality

### Lead Management

- Create new leads with details like budget range, contact information, and property preferences
- Retrieve all leads with optional search functionality
- Get detailed information for a specific lead
- Update lead information
- Delete leads
- Filter leads by listing ID and other criteria

**Data Structure**
The lead model includes:

- Basic contact information (name, phone number, email)
- Budget range (minimum and maximum)
- Property preferences (preferred locations, property types)
- Relationship to broker (brokerId)
- Optional notes
- Listing association

## Technical Implementation

**Service Layer**
The `LeadsService` class handles the business logic with these key methods:

- `create()`: Creates a new lead with validation for duplicate phone numbers
- `findAll()`: Retrieves all leads for a broker with optional text search
- `findOne()`: Gets a specific lead by ID
- `update()`: Updates lead information
- `remove()`: Deletes a lead
- `filterByListing()`: Filters leads by listing ID and additional criteria

**Controller Layer**
The `LeadsController` exposes RESTful endpoints:

- `POST /leads`: Create a new lead
- `GET /leads`: Retrieve all leads with optional search
- `GET /leads/filter/listing`: Filter leads by listing
- `GET /leads/:id`: Get a specific lead
- `PATCH /leads/:id`: Update a lead
- `DELETE /leads/:id`: Delete a lead

**Security**

- All endpoints are protected with `AuthGuard`
- Role-based access control restricts access to ADMIN and BROKER roles
- User context is used to ensure brokers can only access their own leads

**Error Handling**

- Duplicate phone numbers are caught and return appropriate error messages
- Not found errors are handled for missing leads
- General error handling with appropriate error messages

## Integration Points

The module integrates with:

- Authentication system via guards and decorators
- Prisma ORM for database operations
- Property listings through relationship mapping

This module serves as a comprehensive lead management system for real estate brokers to track and manage potential clients interested in properties.
