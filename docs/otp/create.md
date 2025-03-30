# OTP Creation Service

The OTP Creation Service is a critical component of the Houzie backend authentication system, responsible for generating, storing, and managing one-time passwords (OTPs) for various verification purposes.

## Core Functionality

The `createOTP` method is the central function of this service, handling the generation and storage of OTPs with the following features:

- Secure 6-digit OTP generation
- Automatic expiration timing (10 minutes)
- Database persistence
- Type-specific OTP categorization
- Comprehensive error handling

## Implementation Details

```typescript
async createOTP(userId: string, type: OTPType): Promise {
  try {
    // Generate a random 6-digit OTP
    const code = this.generateOTP();
    
    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store OTP in database with user association
    await this.prisma.oTP.create({
      data: { code, type, expiresAt, userAuthId: userId },
    });

    // Return the generated code for delivery
    return code;
  } catch (error) {
    // Log error details for troubleshooting
    this.logger.error(
      `Failed to create OTP for user: ${userId}`,
      error.stack,
    );
    
    // Throw standardized exception
    throw new InternalServerErrorException(
      ERROR_MESSAGES.OTP_CREATION_FAILED,
    );
  }
}
```

## OTP Types

The service supports multiple OTP types (defined in the `OTPType` enum from Prisma client):

- `EMAIL_VERIFICATION`: For verifying user email addresses
- `PHONE_VERIFICATION`: For verifying user phone numbers
- `PASSWORD_RESET`: For secure password reset workflows
- `TWO_FACTOR_AUTH`: For two-factor authentication

## Database Schema

The OTP is stored in the database with the following structure:

- `id`: Unique identifier for the OTP record
- `code`: The generated OTP code
- `type`: The purpose/type of the OTP (from OTPType enum)
- `expiresAt`: Timestamp when the OTP becomes invalid
- `isUsed`: Boolean flag to prevent reuse of OTPs
- `userAuthId`: Foreign key linking to the user

## Error Handling

The service implements robust error handling:

- All exceptions are logged with detailed context
- Standardized error messages from `ERROR_MESSAGES` constant
- InternalServerErrorException thrown for all creation failures

## Usage Examples

The OTP creation service can be used in various authentication flows:

```typescript
// Example: Email verification flow
async initiateEmailVerification(userId: string, email: string) {
  // Generate and store the OTP
  const otpCode = await this.otpService.createOTP(
    userId, 
    OTPType.EMAIL_VERIFICATION
  );
  
  // Send the OTP to the user's email
  await this.emailService.sendOTPEmail(email, otpCode);
  
  return { 
    success: true, 
    message: 'Verification code sent to your email' 
  };
}
```

## Security Considerations

- OTPs are single-use only (enforced by `isUsed` flag)
- Short expiration time (10 minutes) limits attack window
- Separate OTP types prevent cross-purpose exploitation
