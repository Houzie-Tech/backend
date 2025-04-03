# Admin Module Overview

The Admin module in the Houzie backend provides comprehensive administrative functionality for platform management, including dashboard metrics, broker performance analysis, user management, and permission control. This module serves as the central control hub for administrators to monitor and manage the entire application ecosystem.

## Core Functionality

The Admin module offers robust administrative capabilities organized around several key areas:

- **Dashboard Analytics**: Comprehensive metrics about platform activity and performance
- **Broker Management**: Analysis of broker performance and scoring
- **User Administration**: Role-based user management and permission controls
- **Listing Oversight**: Monitoring of property listing status and performance

## Key Components

The Admin module is organized into specialized services, each handling a specific administrative domain:

- **AdminService**: Core service providing dashboard metrics and overall platform statistics
- **BrokerAdminService**: Handles broker performance analysis and scoring
- **ListingAdminService**: Manages listing-related administrative functions
- **UserAdminService**: Controls user management and permission settings

## Controller Structure

The AdminController exposes RESTful endpoints for administrative operations, all protected by the AuthGuard and restricted to users with the ADMIN role:

```typescript
@UseGuards(AuthGuard)
@Controller('admin')
export class AdminController {
  // Dashboard metrics
  @Get(`metrics`)
  
  // Broker management
  @Get(`brokers/gettopbrokers`)
  @Get(`brokers/:brokerId/score`)
  
  // User management
  @Get(`users/:role`)
  @Put('users/updatepermission/:id')
}
```

## API Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/admin/metrics` | Get comprehensive dashboard metrics | Required (ADMIN only) |
| GET | `/admin/brokers/gettopbrokers` | Retrieve top-performing brokers | Required (ADMIN only) |
| GET | `/admin/brokers/:brokerId/score` | Get detailed performance score for a specific broker | Required (ADMIN only) |
| GET | `/admin/users/:role` | List all users with a specific role | Required (ADMIN only) |
| PUT | `/admin/users/updatepermission/:id` | Update a user's role/permissions | Required (ADMIN only) |

## Features

### Dashboard Analytics

The dashboard metrics endpoint provides a comprehensive overview of platform performance:

```typescript
@Get(`metrics`)
async getDashboardMetrics() {
  const [listings, users, leads, activities, quickActions] =
    await Promise.all([
      this.adminService.getListingStatusBreakdown(),
      this.adminService.getUserRegistrationStats(),
      this.adminService.getLeadConversionMetrics(),
      this.adminService.getRecentActivities(),
      this.adminService.getQuickActionStats(),
    ]);

  return {
    listings,
    users,
    leads,
    activities,
    quickActions,
  };
}
```

Key metrics include:

- **Listing Status Breakdown**: Distribution of listings by status (active, pending, sold, etc.)
- **User Registration Statistics**: New user growth trends and role distribution
- **Lead Conversion Metrics**: Lead generation and conversion performance
- **Recent Activities**: Latest actions across the platform
- **Quick Action Stats**: Summary of commonly needed administrative actions

### Broker Performance Analysis

The module provides tools for analyzing broker performance:

1. **Top Brokers Identification**:

   ```typescript
   @Get(`brokers/gettopbrokers`)
   async getTopBrokers() {
     return await this.brokerAdminService.getTopBrokers();
   }
   ```

   Identifies the highest-performing brokers based on various performance metrics

2. **Broker Performance Scoring**:

   ```typescript
   @Get(`brokers/:brokerId/score`)
   async getBrokerScore(@Param('brokerId') brokerId: string): Promise {
     const brokerScore = await this.brokerAdminService.calculateBrokerScore(brokerId);
     return brokerScore;
   }
   ```

   Calculates a comprehensive performance score for a specific broker, likely considering factors like:
   - Listing creation volume
   - Lead conversion rates
   - Client satisfaction metrics
   - Activity levels
   - Response times

### User Management

Administrators can view and manage users based on their roles:

1. **Role-Based User Listing**:

   ```typescript
   @Get(`users/:role`)
   async getAllUsers(@Param('role') role: Role) {
     if (Object.values(Role).includes(role)) {
       return await this.userAdminService.listUsersBasedOnRole(role);
     }
     throw new BadRequestException(`Invalid role ${role}`);
   }
   ```

   Retrieves all users with a specific role (ADMIN, BROKER, USER, etc.)

2. **Permission Management**:

   ```typescript
   @Put('users/updatepermission/:id')
   async updatePermission(
     @Param('id') id: string,
     @Body() body: { role: Role; }
   ) {
     if (!Object.values(Role).includes(body.role)) {
       throw new BadRequestException(`Invalid role: ${body.role}`);
     }
     return await this.userAdminService.updatePermissions(id, body.role);
   }
   ```

   Updates a user's role/permissions with validation to ensure only valid roles are assigned

## Implementation Details

### Service Structure

The Admin module is organized into specialized services:

1. **AdminService**: Core service providing platform-wide metrics

   ```typescript
   class AdminService {
     getListingStatusBreakdown(): Promise
     getUserRegistrationStats(): Promise
     getLeadConversionMetrics(): Promise
     getRecentActivities(): Promise
     getQuickActionStats(): Promise
   }
   ```

2. **BrokerAdminService**: Handles broker performance analysis

   ```typescript
   class BrokerAdminService {
     getTopBrokers(): Promise
     calculateBrokerScore(brokerId: string): Promise
   }
   ```

3. **UserAdminService**: Manages user administration

   ```typescript
   class UserAdminService {
     listUsersBasedOnRole(role: Role): Promise
     updatePermissions(userId: string, role: Role): Promise
   }
   ```

4. **ListingAdminService**: Handles listing administration

   ```typescript
   class ListingAdminService {
     // Methods for listing administration
   }
   ```

### Error Handling

The Admin module implements robust error handling:

- **Input Validation**: Validates role values against the Role enum before processing
- **Bad Request Exceptions**: Thrown when invalid roles are provided
- **Not Found Exceptions**: Likely thrown when users or brokers aren't found (implied)
- **Authentication Errors**: Handled by the AuthGuard
- **Authorization Errors**: Handled by the Roles decorator

### Data Models

The module interacts with several key data models:

1. **BrokerScore**: Performance metrics for brokers

   ```typescript
   interface BrokerScore {
     // Likely includes metrics like:
     overallScore: number;
     listingScore: number;
     leadConversionScore: number;
     activityScore: number;
     // Other performance indicators
   }
   ```

2. **Role Enum**: User role definitions from Prisma client

   ```typescript
   enum Role {
     ADMIN,
     BROKER,
     USER,
     // Possibly other roles
   }
   ```

## Security Considerations

The Admin module implements strong security measures:

- **Authentication**: All endpoints are protected by the AuthGuard
- **Role-Based Access Control**: The Roles decorator ensures only administrators can access these endpoints
- **Input Validation**: All role inputs are validated against the Role enum
- **Exception Handling**: Appropriate exceptions are thrown for invalid inputs

## Integration Points

The Admin module integrates with several other modules and services:

1. **Auth Module**: For authentication and role-based access control
2. **Prisma Service**: For database operations across all administrative functions
3. **User Model**: For user management operations
4. **Broker Module**: For broker performance analysis
5. **Listing Module**: For listing status monitoring
6. **Lead Module**: For lead conversion metrics

This comprehensive overview provides a detailed understanding of the Admin module's functionality, structure, and integration points within the Houzie backend system, serving as a complete reference for developers working with administrative features.
