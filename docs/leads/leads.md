# Leads Module Overview

The Leads module in the Houzie backend provides comprehensive functionality for managing real estate leads throughout their lifecycle. This module enables brokers to create, track, filter, and update leads related to property listings.

## Core Functionality

The Leads module offers a complete lead management system with the following capabilities:

- **Lead Creation**: Generate new leads with detailed property requirements
- **Lead Tracking**: Monitor lead status and engagement throughout the sales funnel
- **Lead Filtering**: Apply advanced filters to identify relevant leads for specific listings
- **Lead Management**: Update lead information, status, and priority as needed

## Key Components

### Controller

The LeadsController exposes RESTful endpoints that handle lead-related operations. All endpoints are protected by authentication and role-based access control, restricting access to users with either 'ADMIN' or 'BROKER' roles.

### Service

The LeadsService contains the business logic for lead management, including:

- Creating new leads with property preferences
- Filtering leads by listing ID and other criteria
- Retrieving individual or collections of leads
- Updating lead information and status
- Removing leads when necessary

### Data Transfer Objects (DTOs)

The module uses several DTOs to handle data validation and transformation:

- **CreateLeadDto**: Defines the structure and validation rules for creating new leads. [link](../../src/leads/dto/create-lead.dto.ts)
- **UpdateLeadDto**: Specifies fields that can be updated on existing leads. [link](../../src/leads/dto/update-lead.dto.ts)
- **FilterLeadsByListingDto**: Contains parameters for advanced lead filtering. [link](../../src/leads/dto/filter.dto.ts)

## API Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/leads` | Create a new lead | Required (ADMIN, BROKER) |
| GET | `/leads` | Fetch all leads with optional search | Required (ADMIN, BROKER) |
| GET | `/leads/filter/listing` | Filter leads by listing with additional criteria | Required (ADMIN, BROKER) |
| GET | `/leads/:id` | Fetch a single lead by ID | Required (ADMIN, BROKER) |
| PATCH | `/leads/:id` | Update a lead by ID | Required (ADMIN, BROKER) |
| DELETE | `/leads/:id` | Remove a lead by ID | Required (ADMIN, BROKER) |

[Try them out!](http://api.houzie.in/api)

## Data Model

Leads contain comprehensive information about potential clients and their property requirements:

- **Basic Information**: Name, email, phone number
- **Budget Constraints**: Minimum and maximum budget
- **Property Preferences**: Preferred locations, property types
- **Sales Funnel Data**: Status, priority, activity state
- **Relationship Information**: Associated broker, related listings

## Key Features

### Lead Creation

The module allows brokers to create detailed lead profiles with comprehensive information about client requirements, including budget range, preferred locations, and property types. The system automatically validates input data and handles potential duplicate entries.

[View Lead Creation Guide](./create_leads.docs.md)

### Advanced Filtering

The filtering system enables brokers to efficiently find relevant leads based on:

- Specific property listings
- Lead status (e.g., new, contacted, qualified)
- Priority level
- Activity status

This functionality supports efficient lead management for brokers handling multiple property listings.

[View Filtering Documentation](./filterByListing.docs.md)
