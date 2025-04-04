# Backend Service Documentation

## Overview

This documentation covers a NestJS backend service for the Houzie application. The service includes global validation, CORS configuration, and Swagger API documentation.

## Server Configuration

The server runs on port 3001 by default, but can be configured through the `PORT` environment variable. Once started, the application is accessible at `http://localhost:3001`.

## Core Features

### Module Structure

The application consists of the following modules, each with its own dedicated documentation:

1. [PrismaModule](./docs/modules/prisma.md) - Database connectivity using Prisma ORM
2. [AuthModule](./docs/modules/auth.md) - Authentication and authorization functionality
3. [FormModule](./docs/modules/form.md) - Form processing and file uploads
4. [BrokerModule](./docs/modules/broker.md) - Managing broker functionality
5. [LeadsModule](./docs/leads/leads.md) - Lead generation and tracking
6. [ProfileMessageModule](./docs/modules/profile.md) - User profile management
7. [AdminModule](./docs/modules/admin.md) - Administrative functionality
8. [ReportsModule](./docs/modules/reports.md) - Reporting and analytics
9. [UserPreferenceModule](./docs/modules/user-preference.md) - User preference calculations
10. [PropertyDescriptionModule](./docs/modules/property_description.md) - Property descriptions for listings
11. [MailerModule](./docs/modules/mail.md) - mailer integration
12. [OTPModule](./docs/modules/otp.md) - otp integration
13. [MetroStationModule](./docs/modules/metro.md) - metro station integration

### Validation

The service implements global request validation using NestJS's ValidationPipe with these options:

- **transform**: `true` - Automatically transforms payloads to DTO instances
- **transformOptions.enableImplicitConversion**: `true` - Enables type conversion
- **whitelist**: `true` - Strips properties not defined in DTOs
- **forbidNonWhitelisted**: `false` - Doesn't throw errors for non-whitelisted properties
- **validateCustomDecorators**: `true` - Validates custom-decorated properties
- **stopAtFirstError**: `false` - Collects all validation errors before responding

## API Documentation

### Authentication

The API uses JWT Bearer authentication:

- **Type**: HTTP
- **Scheme**: Bearer
- **Format**: JWT
- **Location**: Header

### Accessing Documentation

The Swagger UI is available at the `/api` endpoint (e.g., `http://localhost:3001/api`). This interactive documentation allows developers to:

- Browse available endpoints
- View request/response schemas
- Test API calls directly from the browser
- Authenticate using JWT tokens

## Getting Started

To run the application:

1. Copy the `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Start the database using Docker Compose:

```bash
docker compose up -d 
```

3. Install all dependencies:

```bash
npm install
```

4. Start the application:

```bash
npm run start:prod
```

5. For development with hot-reload:

```bash
npm run start:dev
```

6. Access the API documentation at `http://localhost:3001/api`
