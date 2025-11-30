# Flexible Messaging Service - Complete Setup Guide

A production-ready messaging service with support for multiple SMS and email providers, OTP verification, and easy provider switching.

## 🌟 Features

- ✅ **Multiple SMS Providers**: Hubtel, Twilio, Mnotify, Arkesel
- ✅ **Email Support**: SMTP, SendGrid, AWS SES, Mailgun (extensible)
- ✅ **OTP Management**: Generation, verification, rate limiting
- ✅ **Easy Provider Switching**: Change providers at runtime
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Production Ready**: Error handling, validation, logging

## 📁 Project Structure

```
messaging-service/
├── src/
│   ├── messagingService.ts    # Core service with all providers
│   ├── server.ts              # Express API
│   └── types.ts               # TypeScript types (optional)
├── .env                       # Environment variables
├── .env.example              # Environment template
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies
└── README.md
```

## 📦 Installation

### 1. Initialize Project

```bash
mkdir messaging-service
cd messaging-service
npm init -y
```

### 2. Install Dependencies

```bash
npm install express redis axios nodemailer dotenv cors helmet morgan
npm install --save-dev typescript ts-node nodemon @types/express @types/node @types/nodemailer @types/cors @types/morgan
```

### 3. Create `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. Update `package.json`

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

## 🔧 Configuration

### Environment Variables Template (`.env`)

```bash
# Server
PORT=3000
NODE_ENV=development

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# SMS Provider Selection (choose one: hubtel, twilio, mnotify, arkesel)
SMS_PROVIDER=hubtel

# Hubtel Configuration
HUBTEL_CLIENT_ID=your_hubtel_client_id
HUBTEL_CLIENT_SECRET=your_hubtel_client_secret
HUBTEL_SENDER_ID=YourBrand

# Twilio Configuration (optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+1234567890

# Mnotify Configuration (optional)
MNOTIFY_API_KEY=your_mnotify_api_key
MNOTIFY_SENDER_ID=YourBrand

# Arkesel Configuration (optional)
ARKESEL_API_KEY=your_arkesel_api_key
ARKESEL_SENDER_ID=YourBrand

# Email Provider Selection (choose one: smtp, sendgrid, aws-ses, mailgun)
EMAIL_PROVIDER=smtp

# SMTP Configuration
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USERNAME=your_email@domain.com
SMTP_PASSWORD=your_password
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=Your App Name
SMTP_USE_TLS=true
```

## 🇬🇭 SMS Providers Setup (Ghana)

### Option 1: Hubtel (Recommended for Ghana)

**Setup:**
1. Visit: https://developers.hubtel.com
2. Create account and verify
3. Get API credentials from dashboard
4. Request Sender ID approval
5. Fund your account

**Pricing:** ~GHS 0.03-0.05 per SMS

**Configuration:**
```bash
SMS_PROVIDER=hubtel
HUBTEL_CLIENT_ID=your_client_id
HUBTEL_CLIENT_SECRET=your_client_secret
HUBTEL_SENDER_ID=YourBrand
```

### Option 2: Mnotify

**Setup:**
1. Visit: https://www.mnotify.com
2. Register and verify account
3. Get API key from dashboard
4. Register Sender ID

**Pricing:** Competitive rates for Ghana

**Configuration:**
```bash
SMS_PROVIDER=mnotify
MNOTIFY_API_KEY=your_api_key
MNOTIFY_SENDER_ID=YourBrand
```

### Option 3: Arkesel

**Setup:**
1. Visit: https://arkesel.com
2. Create account
3. Get API key
4. Register Sender ID

**Pricing:** Affordable Ghana rates

**Configuration:**
```bash
SMS_PROVIDER=arkesel
ARKESEL_API_KEY=your_api_key
ARKESEL_SENDER_ID=YourBrand
```

### Option 4: Twilio (International)

**Setup:**
1. Visit: https://www.twilio.com
2. Sign up and verify
3. Get Account SID and Auth Token
4. Purchase a phone number

**Pricing:** Pay-as-you-go, higher for Ghana

**Configuration:**
```bash
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890
```

## 📧 Email Setup

### Option 1: Self-Hosted SMTP (Postfix)

```bash
sudo apt update
sudo apt install postfix mailutils
sudo systemctl restart postfix
```

**Configuration:**
```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=25
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_USE_TLS=false
```

### Option 2: Gmail SMTP (Testing Only)

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your.email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your.email@gmail.com
SMTP_USE_TLS=true
```

## 🚀 Running the Service

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📡 API Endpoints

### 1. Health Check
```bash
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-30T10:00:00.000Z",
  "providers": {
    "sms": "Hubtel",
    "email": "SMTP"
  }
}
```

### 2. Get Active Providers
```bash
GET /api/providers
```

### 3. Send SMS
```bash
POST /api/sms/send
Content-Type: application/json

{
  "to": "233241234567",
  "message": "Hello from our service!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "SMS sent successfully",
  "provider": "Hubtel",
  "data": { "messageId": "xxx" }
}
```

### 4. Send Email
```bash
POST /api/email/send
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Welcome!",
  "htmlBody": "<h1>Welcome to our service</h1>",
  "textBody": "Welcome to our service"
}
```

### 5. Send OTP (SMS or Email)
```bash
POST /api/otp/send
Content-Type: application/json

{
  "channel": "sms",
  "identifier": "233241234567",
  "brandName": "MyApp"
}
```

### 6. Verify OTP
```bash
POST /api/otp/verify
Content-Type: application/json

{
  "identifier": "233241234567",
  "otp": "123456"
}
```

### 7. Switch SMS Provider (Runtime)
```bash
POST /api/providers/sms/switch
Content-Type: application/json

{
  "provider": "mnotify",
  "credentials": {
    "apiKey": "your_mnotify_key",
    "senderId": "YourBrand"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Switched to mnotify",
  "activeProvider": "Mnotify"
}
```

## 🔌 Frontend Integration Examples

### React/TypeScript Client

```typescript
// src/services/messaging.ts
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const messagingClient = {
  // Send SMS
  sendSMS: async (to: string, message: string) => {
    const response = await axios.post(`${API_URL}/sms/send`, { to, message });
    return response.data;
  },

  // Send Email
  sendEmail: async (to: string, subject: string, htmlBody: string, textBody?: string) => {
    const response = await axios.post(`${API_URL}/email/send`, {
      to, subject, htmlBody, textBody
    });
    return response.data;
  },

  // Send OTP
  sendOTP: async (channel: 'sms' | 'email', identifier: string, brandName?: string) => {
    const response = await axios.post(`${API_URL}/otp/send`, {
      channel, identifier, brandName
    });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (identifier: string, otp: string) => {
    const response = await axios.post(`${API_URL}/otp/verify`, {
      identifier, otp
    });
    return response.data;
  },

  // Get active providers
  getProviders: async () => {
    const response = await axios.get(`${API_URL}/providers`);
    return response.data;
  }
};
```

### React Component Example

```tsx
import React, { useState } from 'react';
import { messagingClient } from './services/messaging';

const MessagingDemo: React.FC = () => {
  const [phone, setPhone] = useState('233');
  const [message, setMessage] = useState('');

  const handleSendSMS = async () => {
    try {
      const result = await messagingClient.sendSMS(phone, message);
      alert(result.message);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error sending SMS');
    }
  };

  const handleSendOTP = async () => {
    try {
      const result = await messagingClient.sendOTP('sms', phone, 'MyApp');
      alert(result.message);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error sending OTP');
    }
  };

  return (
    <div>
      <h2>Messaging Service</h2>
      
      <input
        type="tel"
        placeholder="233XXXXXXXXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      
      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      
      <button onClick={handleSendSMS}>Send SMS</button>
      <button onClick={handleSendOTP}>Send OTP</button>
    </div>
  );
};

export default MessagingDemo;
```

## 🔄 Switching Providers

### At Startup (Environment Variable)
```bash
# Change provider in .env
SMS_PROVIDER=mnotify
```

### At Runtime (API Call)
```bash
curl -X POST http://localhost:3000/api/providers/sms/switch \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "arkesel",
    "credentials": {
      "apiKey": "your_arkesel_key",
      "senderId": "YourBrand"
    }
  }'
```

### Programmatically (TypeScript)
```typescript
import { messagingService } from './messagingService';

// Switch to Twilio
messagingService.switchSMSProvider({
  provider: 'twilio',
  credentials: {
    accountSid: 'your_sid',
    authToken: 'your_token',
    fromNumber: '+1234567890'
  }
});

// Check active provider
console.log(messagingService.getActiveProviders());
// Output: { sms: 'Twilio', email: 'SMTP' }
```

## 🛡️ Adding New SMS Providers

To add a new SMS provider, implement the `ISMSProvider` interface:

```typescript
class NewSMSProvider implements ISMSProvider {
  constructor(config: NewProviderConfig) {
    // Initialize with credentials
  }

  getProviderName(): string {
    return 'NewProvider';
  }

  async sendSMS(to: string, message: string): Promise<SendResult> {
    // Implement SMS sending logic
  }

  async sendOTP(to: string, otp: string): Promise<SendResult> {
    // Implement OTP sending logic
  }
}
```

Then add it to the `SMSService.createProvider()` method.

## 💰 Cost Comparison (Ghana)

| Provider | Cost per SMS | Setup | Reliability |
|----------|-------------|-------|-------------|
| Hubtel   | GHS 0.03-0.05 | Easy | High |
| Mnotify  | GHS 0.03-0.04 | Easy | High |
| Arkesel  | GHS 0.03-0.05 | Easy | Medium |
| Twilio   | $0.05-0.10 (GHS 0.60+) | Easy | Very High |

**Recommendation:** Start with Hubtel for Ghana, keep Twilio as backup.

## 🐛 Troubleshooting

### SMS not sending
- Check provider credentials
- Verify account balance
- Check sender ID approval status
- Test phone number format

### Email not sending
- Check SMTP credentials
- Test SMTP connection: `telnet smtp.host.com 587`
- Check firewall rules

### Redis errors
- Verify Redis is running: `redis-cli ping`
- Check connection details in .env

## 📊 Monitoring & Logs

All API calls log the active provider:
```
📱 SMS Provider: Hubtel
📧 Email Provider: SMTP
```

Add custom logging as needed for your monitoring solution.

## 🔒 Security Best Practices

1. Use environment variables for all credentials
2. Enable rate limiting (built-in)
3. Use HTTPS in production
4. Implement API key authentication
5. Monitor for unusual activity
6. Rotate credentials regularly

## 📚 Next Steps

- [ ] Add API authentication (JWT, API keys)
- [ ] Implement webhook handlers for delivery reports
- [ ] Add message templates system
- [ ] Create admin dashboard
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Add message queuing (Bull, RabbitMQ)
- [ ] Implement fallback providers (auto-switch on failure)