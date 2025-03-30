# SMS Service Overview

The SMS Service in the Houzie backend is responsible for handling SMS message delivery for various application features such as OTP verification, notifications, and alerts.

## Key Features

**SMS Delivery**

- Send single SMS messages to users
- Support for verification codes/OTPs
- Error handling and logging for failed deliveries

**Integration Options**

The service can be implemented using one of several providers:

**Twilio Integration**

- Industry-standard SMS delivery service
- Requires Twilio account credentials (SID, Auth Token)
- Supports global SMS delivery

## Implementation Details

### Configuration Requirements

The SMS service requires the following environment variables:

- `SMS_PROVIDER`: The selected provider (e.g., "twilio", "termii")
- Provider-specific credentials:
  - For Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

### Core Methods

**Basic Implementation**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private twilioClient: twilio.Twilio;
  private readonly logger = new Logger(SmsService.name);

  constructor(private config: ConfigService) {
    this.twilioClient = twilio(
      this.config.get('TWILIO_ACCOUNT_SID'),
      this.config.get('TWILIO_AUTH_TOKEN')
    );
  }

  async sendSms(phoneNumber: string, message: string): Promise {
    try {
      await this.twilioClient.messages.create({
        body: message,
        from: this.config.get('TWILIO_PHONE_NUMBER'),
        to: phoneNumber
      });
      
      this.logger.log(`SMS sent successfully to: ${phoneNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS to: ${phoneNumber}`, error.stack);
      throw new Error('Failed to send SMS');
    }
  }

  async sendOtpSms(phoneNumber: string, code: string): Promise {
    const message = `Your verification code is: ${code}. It will expire in 10 minutes.`;
    return this.sendSms(phoneNumber, message);
  }
}
```

## Usage Examples

The SMS service can be injected into other services or controllers:

```typescript
// Example usage in auth service
constructor(private smsService: SmsService) {}

async requestPhoneVerification(userId: string, phoneNumber: string) {
  // Generate OTP code
  const otpCode = await this.otpService.createOTP(userId, OTPType.PHONE_VERIFICATION);
  
  // Send OTP via SMS
  await this.smsService.sendOtpSms(phoneNumber, otpCode);
  
  return { message: 'Verification code sent to your phone' };
}
```

## Error Handling

The service includes comprehensive error handling for:

- Provider initialization failures
- Message delivery failures
- Invalid phone numbers
