# Auth Module Documentation

## Overview

The Auth Module for the Houzie application provides comprehensive authentication and authorization functionality. It supports multiple authentication methods including email/password, OTP-based authentication (email and phone), and Google OAuth integration.

## Features

### Authentication Methods

1. **Email/Password Authentication**
   - Traditional login using email and password
   - Password hashing using bcrypt for security
   - Validation of credentials against database records

2. **OTP-based Authentication**
   - Email OTP verification
   - Phone OTP verification
   - Separate verification statuses for email and phone
   - Configurable OTP expiration (default: 5 minutes)

3. **OAuth Integration**
   - Google OAuth 2.0 authentication
   - Profile information retrieval from Google
   - Automatic user creation for first-time OAuth users

### Token Management

1. **JWT Authentication**
   - Access tokens with configurable expiration
   - Refresh tokens for extended sessions
   - Token payload includes user role and verification status

2. **Refresh Token Mechanism**
   - Secure refresh token rotation
   - Database-backed token storage
   - 7-day default expiration for refresh tokens

### User Registration

- Support for multiple user roles (ADMIN, BROKER, RENTER, etc.)
- Unique constraint enforcement (email, phone, aadhar)
- Automatic verification process initiation

## Implementation Details

### Module Structure

The Auth Module is composed of:

1. **AuthController**: Handles HTTP requests for authentication endpoints
2. **AuthService**: Implements authentication business logic
3. **OTPService**: Manages OTP generation, verification, and delivery
4. **GoogleStrategy**: Configures and implements Google OAuth authentication
5. **Custom Decorators**: `GetUser` and `User` for easy access to authenticated user data

### Authentication Flow

#### Email/Password Registration and Login

1. User registers with email, password, and profile information
2. Password is hashed and stored
3. Verification OTPs are sent to email/phone
4. User logs in with email and password
5. JWT tokens are issued upon successful authentication

#### OTP-based Login

1. User initiates login with email or phone number
2. System generates and sends OTP
3. User submits OTP for verification
4. Upon successful verification, JWT tokens are issued
5. User verification status is updated

#### Google OAuth

1. User is redirected to Google's authentication page
2. After successful Google authentication, user is redirected back with profile data
3. System creates a new user record if email is not found
4. JWT tokens are issued
5. User is redirected to the frontend application

### Security Considerations

- Passwords are never stored in plain text
- OTPs have limited validity periods
- Refresh tokens are rotated on use
- JWT secrets are configurable via environment variables
- Rate limiting is recommended for production deployments

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register a new user |
| `/auth/login/email/pw` | POST | Login with email and password |
| `/auth/login/initiate` | POST | Initiate OTP-based login |
| `/auth/login/verify` | POST | Verify OTP and complete login |
| `/auth/refresh` | POST | Refresh access token |
| `/auth/google` | GET | Initiate Google OAuth flow |
| `/auth/google-redirect` | GET | Handle Google OAuth callback |

## Configuration

The Auth Module uses environment variables for configuration:

```
# JWT Configuration
JWT_SECRET="your_jwt_secret_key"
JWT_EXPIRES_IN=3600s
REFRESH_TOKEN_SECRET="your_refresh_token_secret"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_CALLBACK_URL="your_callback_url"
FRONTEND_URL="your_frontend_url"

# SMTP Configuration for Email OTP
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your_smtp_username"
SMTP_PASS="your_smtp_password"
SMTP_FROM="your_from_email"

# SMS API Configuration for SMS OTP
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_PHONE_NUMBER="your_twilio_phone_number"

# OTP Configuration
OTP_EXPIRATION_TIME=300 # OTP validity in seconds (5 minutes)
```

## Integration with Other Modules

The Auth Module integrates with:

1. **PrismaModule**: For database operations
2. **ConfigModule**: For environment variable access
3. **JwtModule**: For token generation and validation
4. **PassportModule**: For OAuth strategy implementation

## Why These Choices?

1. **Multiple Authentication Methods**: Provides flexibility for users to authenticate using their preferred method
2. **JWT-based Authentication**: Stateless authentication that scales well in distributed systems
3. **Refresh Token Rotation**: Enhances security by limiting the lifetime of authentication credentials
4. **Google OAuth**: Simplifies user onboarding with a trusted third-party authentication provider
5. **OTP Verification**: Adds an additional layer of security and verifies user contact information
