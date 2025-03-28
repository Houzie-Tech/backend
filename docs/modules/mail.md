# MailerService Overview

The `MailerService` is a core utility service in the Houzie backend responsible for handling all email communication functionalities. This service provides a standardized interface for sending various types of emails throughout the application.

## Key Features

**Email Transport Configuration**

- Utilizes nodemailer to establish SMTP connections
- Loads configuration from environment variables via ConfigService
- Implements error handling during transporter initialization

**General Email Functionality**

- Provides a flexible `sendEmail()` method that supports both plain text and HTML content
- Includes comprehensive error logging
- Throws appropriate exceptions when email delivery fails

**Specialized Email Templates**

- OTP verification emails with expiration information
- Password reset emails with secure reset links and expiration notices

## Implementation Details

The service is implemented as an injectable NestJS service with the following components:

- **Constructor**: Sets up the nodemailer transporter using SMTP credentials from configuration
- **Error Handling**: Comprehensive logging for both initialization and sending failures
- **Email Methods**:
  - `sendEmail()`: Core method for sending any type of email
  - `sendOTPEmail()`: Specialized method for sending one-time passwords
  - `sendPasswordResetEmail()`: Specialized method for password reset workflows

## Configuration Requirements

The service requires the following environment variables to be properly set:

- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: SMTP server port
- `SMTP_USER`: SMTP authentication username
- `SMTP_PASS`: SMTP authentication password
- `SMTP_FROM`: Default sender email address

## Usage Examples

This service can be injected into other services or controllers to send emails:

```typescript
// Example usage in another service
constructor(private mailerService: MailerService) {}

async requestPasswordReset(email: string) {
  const resetToken = await this.generateResetToken();
  const resetLink = `https://houzie.com/reset-password?token=${resetToken}`;
  
  await this.mailerService.sendPasswordResetEmail(email, resetLink);
  
  return { message: 'Password reset email sent' };
}
```
