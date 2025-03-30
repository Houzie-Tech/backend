# OTPService Overview

The `OTPService` is a specialized service in the Houzie backend responsible for handling one-time password (OTP) generation, delivery, and verification. This service provides a secure way to validate user actions such as account verification and password resets.

## Key Features

**OTP Management**

- Generation of secure 6-digit OTP codes
- Storage of OTPs with expiration timestamps (10 minutes)
- Verification of submitted OTPs against stored records
- Tracking of OTP usage status

**Multi-Channel Delivery**

- Email delivery using nodemailer
- SMS delivery capability via Twilio (currently disabled)
- Comprehensive error handling for both delivery methods

**Security Features**

- Time-limited OTP validity
- Single-use OTP enforcement
- Type-specific OTPs for different verification purposes

## Implementation Details

The service is implemented as an injectable NestJS service with the following components:

- **Constructor**: Sets up both Twilio and nodemailer clients using configuration
- **Error Handling**: Comprehensive logging for initialization and operation failures
- **Core Methods**:
  - `createOTP()`: Generates and stores a new OTP for a specific user and purpose
  - `sendEmailOTP()`: Delivers OTP via email
  - `sendSMSOTP()`: Delivers OTP via SMS (implementation commented out)
  - `verifyOTP()`: Validates submitted OTPs and marks them as used

**Special Notes**:

- Currently includes a development backdoor allowing `000000` as a valid OTP
- SMS functionality is prepared but commented out in the implementation

## Configuration Requirements

The service requires the following environment variables:

- Twilio configuration: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- SMTP configuration: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

## Usage Examples

This service can be injected into authentication flows:

```typescript
// Example usage in an auth service
async requestEmailVerification(userId: string, email: string) {
  // Generate and store OTP
  const otpCode = await this.otpService.createOTP(userId, OTPType.EMAIL_VERIFICATION);
  
  // Send OTP to user's email
  await this.otpService.sendEmailOTP(email, otpCode);
  
  return { message: 'Verification code sent to your email' };
}

async verifyEmail(userId: string, code: string) {
  const verified = await this.otpService.verifyOTP(
    userId, 
    code, 
    OTPType.EMAIL_VERIFICATION
  );
  
  if (verified) {
    // Update user's email verification status
    return { message: 'Email verified successfully' };
  }
}
```