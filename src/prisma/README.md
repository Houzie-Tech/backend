# Houzie Database Schema Documentation

## Overview

This document provides a comprehensive overview of the Houzie application's database schema, implemented using Prisma ORM with PostgreSQL as the database provider.

## Schema Structure

The schema defines various models and enumerations to support a real estate platform focused on property listings, user management, and lead tracking.

## Models

### User

Represents users of the platform with different roles:

- Properties: id, name, email, phoneNumber, aadharNumber, companyName, role, privacySetting, gender
- Relationships: listings, verifiedListings, favorites, visitedListings, leads, userAuth, reports

### UserAuth

Handles authentication for users:

- Properties: id, password, isEmailVerified, isPhoneVerified, provider, providerId, accessToken
- Relationships: otps, refreshTokens, user

### OTP

Manages one-time passwords for verification:

- Properties: id, code, type, expiresAt, isUsed
- Relationships: UserAuth

### RefreshToken

Stores refresh tokens for JWT authentication:

- Properties: id, token, expires
- Relationships: UserAuth

### Listing

Core model for property listings:

- Properties: id, title, propertyType, images, price details, property specifications, amenities, features
- Relationships: location, broker, leads, favoritedBy, visitedBy, reports, occupants

### Occupant

Represents current occupants of a property:

- Properties: id, name, age, profession, about, gender
- Relationships: listing

### Report

Tracks user reports about listings:

- Properties: id, reason, details, status
- Relationships: listing, reportedBy

### FavoriteListing

Junction model for users' favorite listings:

- Properties: id, userId, listingId, createdAt
- Relationships: user, listing

### VisitedListing

Tracks which listings users have viewed:

- Properties: id, userId, listingId, visitedAt
- Relationships: user, listing

### Location

Stores geographical information for listings:

- Properties: id, city, state, country, latitude, longitude
- Relationships: listings

### Lead

Manages potential customer information:

- Properties: id, name, contact details, budget range, preferences, status, priority
- Relationships: listing, broker

## Enumerations

The schema includes several enumerations to standardize data values:

- **Role**: User roles (ADMIN, BROKER, RENTER, etc.)
- **OTPType**: Types of OTP verification (EMAIL, PHONE)
- **ReportStatus**: Status of listing reports (PENDING, REVIEWED, etc.)
- **ListingStatus**: Status of property listings (PENDING, APPROVED, etc.)
- **PropertyType**: Types of properties (FLAT_APARTMENT, VILLA, etc.)
- **Furnishing**: Furnishing status (NONE, FULLY_FURNISHED, etc.)
- **LeadStatus**: Status of sales leads (NEW, CONTACTED, etc.)
- **Priority**: Priority levels for leads (LOW, MEDIUM, HIGH, URGENT)
- **SharingType**: Types of room sharing (SINGLE, DOUBLE_SHARING, etc.)
- **Configuration**: Property configurations (ONE_BHK, TWO_BHK, etc.)
- **Gender**: Gender options (MALE, FEMALE, OTHER)

## Usage

This schema is designed to be used with Prisma Client, which provides type-safe database queries for your application. The schema supports various real estate operations including property listing management, user authentication, lead tracking, and more.

## Database Connection

The database connection is configured through the `DATABASE_URL` environment variable, which should point to your PostgreSQL database.

```
DATABASE_URL="postgresql://username:password@hostname:port/database"
```

## Schema Updates

When making changes to the schema:

1. Update the `schema.prisma` file
2. Run `npx prisma migrate dev --name descriptive_name` to create a migration
3. Run `npx prisma generate` to update the Prisma Client

## Entity Relationships

The schema implements various relationships:

- One-to-one: User to UserAuth
- One-to-many: User to Listings, Location to Listings
- Many-to-many: Users to Favorite Listings, Users to Visited Listings

These relationships are optimized with appropriate indexes for query performance.
