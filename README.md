# BlazeSend Messaging Service

A production-ready messaging service with support for multiple SMS and email providers, OTP verification, and easy runtime provider switching.

## 🌟 Features

- ✅ **Multiple SMS Providers**: Hubtel, Twilio, Mnotify, Arkesel
- ✅ **Email Support**: SMTP (extensible to SendGrid, AWS SES, Mailgun)
- ✅ **OTP Management**: Generation, verification with rate limiting
- ✅ **Runtime Provider Switching**: Change providers without restart
- ✅ **Type-Safe**: Full TypeScript support with strict mode
- ✅ **Production Ready**: Error handling, validation, logging, graceful shutdown
- ✅ **Security**: SHA-256 OTP hashing, rate limiting, attempt limiting

## 📦 Installation

### 1. Clone and Install Dependencies

```bash
cd blazeSend
npm install
```

### 2. Set Up Redis

**Windows (Docker - Recommended):**
```bash
docker run -d --name blazesend-redis -p 6379:6379 --restart unless-stopped redis:alpine
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update && sudo apt install redis-server
sudo systemctl start redis
```

**Redis Cloud (Free Tier):**
- Visit https://redis.com/try-free/
- Create account and database
- Add `REDIS_PASSWORD` to your `.env` file

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and configure your providers:

```bash
cp .env.example .env
```

Edit `.env` with your credentials (see Provider Setup below).

## 🔧 Provider Setup

### SMS Providers

#### Option 1: Hubtel (Recommended for Ghana)

1. Visit https://developers.hubtel.com
2. Create account and verify
3. Get API credentials from dashboard
4. Request Sender ID approval
5. Fund your account

```bash
SMS_PROVIDER=hubtel
HUBTEL_CLIENT_ID=your_client_id
HUBTEL_CLIENT_SECRET=your_client_secret
HUBTEL_SENDER_ID=YourBrand
```

**Pricing:** ~GHS 0.03-0.05 per SMS

#### Option 2: Twilio (International)

1. Visit https://www.twilio.com
2. Sign up and get Account SID and Auth Token
3. Purchase a phone number

```bash
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890
```

#### Option 3: Mnotify (Ghana)

1. Visit https://www.mnotify.com
2. Register and get API key
3. Register Sender ID

```bash
SMS_PROVIDER=mnotify
MNOTIFY_API_KEY=your_api_key
MNOTIFY_SENDER_ID=YourBrand
```

#### Option 4: Arkesel (Ghana)

1. Visit https://arkesel.com
2. Get API key

```bash
SMS_PROVIDER=arkesel
ARKESEL_API_KEY=your_api_key
ARKESEL_SENDER_ID=YourBrand
```

### Email Provider

#### SMTP Configuration

**Gmail (Testing Only):**
```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your.email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your.email@gmail.com
SMTP_FROM_NAME=BlazeSend
SMTP_USE_TLS=true
```

**Note:** For Gmail, you need to create an App Password: https://support.google.com/accounts/answer/185833

**Self-Hosted Postfix:**
```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=25
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=BlazeSend
SMTP_USE_TLS=false
```

## 🚀 Running the Service

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

The server will start on port 3000 (or PORT from `.env`).

## 📡 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Health Check
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

#### 2. Get Active Providers
```bash
GET /api/providers
```

**Response:**
```json
{
  "success": true,
  "providers": {
    "sms": "Hubtel",
    "email": "SMTP"
  }
}
```

#### 3. Send SMS
```bash
POST /api/sms/send
Content-Type: application/json

{
  "to": "233241234567",
  "message": "Hello from BlazeSend!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "SMS sent successfully via Hubtel",
  "provider": "Hubtel",
  "data": { "messageId": "xxx" }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"to": "233241234567", "message": "Hello from BlazeSend!"}'
```

#### 4. Send Email
```bash
POST /api/email/send
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Welcome!",
  "htmlBody": "<h1>Welcome to BlazeSend</h1>",
  "textBody": "Welcome to BlazeSend"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully via SMTP",
  "provider": "SMTP"
}
```

#### 5. Send OTP
```bash
POST /api/otp/send
Content-Type: application/json

{
  "channel": "sms",
  "identifier": "233241234567",
  "brandName": "MyApp"
}
```

- **channel**: `"sms"` or `"email"`
- **identifier**: Phone number for SMS or email address for email
- **brandName** (optional): Customize OTP message branding

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully via sms"
}
```

**Rate Limit:** 3 OTPs per hour per identifier

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"channel": "sms", "identifier": "233241234567", "brandName": "MyApp"}'
```

#### 6. Verify OTP
```bash
POST /api/otp/verify
Content-Type: application/json

{
  "identifier": "233241234567",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

**Response (Invalid):**
```json
{
  "success": false,
  "message": "Invalid OTP. 2 attempt(s) remaining"
}
```

**Security:**
- Maximum 3 verification attempts
- OTP expires after 10 minutes
- OTP is hashed with SHA-256 before storage

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"identifier": "233241234567", "otp": "123456"}'
```

#### 7. Switch SMS Provider (Runtime)
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
  "message": "Switched to Mnotify",
  "activeProvider": "Mnotify"
}
```

**Provider Credentials:**

**Hubtel:**
```json
{
  "provider": "hubtel",
  "credentials": {
    "clientId": "xxx",
    "clientSecret": "xxx",
    "senderId": "Brand"
  }
}
```

**Twilio:**
```json
{
  "provider": "twilio",
  "credentials": {
    "accountSid": "xxx",
    "authToken": "xxx",
    "fromNumber": "+1234567890"
  }
}
```

**Mnotify:**
```json
{
  "provider": "mnotify",
  "credentials": {
    "apiKey": "xxx",
    "senderId": "Brand"
  }
}
```

**Arkesel:**
```json
{
  "provider": "arkesel",
  "credentials": {
    "apiKey": "xxx",
    "senderId": "Brand"
  }
}
```

## 💻 Frontend Integration

### React/TypeScript Example

```typescript
// services/messaging.ts
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const messagingClient = {
  sendSMS: async (to: string, message: string) => {
    const response = await axios.post(`${API_URL}/sms/send`, { to, message });
    return response.data;
  },

  sendOTP: async (channel: 'sms' | 'email', identifier: string, brandName?: string) => {
    const response = await axios.post(`${API_URL}/otp/send`, {
      channel,
      identifier,
      brandName,
    });
    return response.data;
  },

  verifyOTP: async (identifier: string, otp: string) => {
    const response = await axios.post(`${API_URL}/otp/verify`, {
      identifier,
      otp,
    });
    return response.data;
  },
};
```

### React Component Example

```tsx
import React, { useState } from 'react';
import { messagingClient } from './services/messaging';

const OTPVerification: React.FC = () => {
  const [phone, setPhone] = useState('233');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'send' | 'verify'>('send');

  const handleSendOTP = async () => {
    try {
      await messagingClient.sendOTP('sms', phone, 'MyApp');
      alert('OTP sent!');
      setStep('verify');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error sending OTP');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const result = await messagingClient.verifyOTP(phone, otp);
      alert(result.message);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div>
      <input
        type="tel"
        placeholder="233XXXXXXXXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      
      {step === 'send' ? (
        <button onClick={handleSendOTP}>Send OTP</button>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleVerifyOTP}>Verify OTP</button>
        </>
      )}
    </div>
  );
};
```

## 🔒 Security Features

- **OTP Hashing**: All OTPs are hashed with SHA-256 before Redis storage
- **Rate Limiting**: Maximum 3 OTP requests per hour per identifier
- **Attempt Limiting**: Maximum 3 verification attempts per OTP
- **Auto Expiration**: OTPs expire after 10 minutes
- **Input Validation**: All endpoints validate required fields and formats
- **Helmet**: Security headers enabled
- **CORS**: Configurable cross-origin resource sharing

## 💰 Cost Comparison (Ghana Market)

| Provider | Cost per SMS | Setup | Reliability |
|----------|-------------|-------|-------------|
| Hubtel   | GHS 0.03-0.05 | Easy | High |
| Mnotify  | GHS 0.03-0.04 | Easy | High |
| Arkesel  | GHS 0.03-0.05 | Easy | Medium |
| Twilio   | $0.05-0.10 (GHS 0.60+) | Easy | Very High |

**Recommendation:** Start with Hubtel for Ghana, keep Twilio as backup for international.

## 🐛 Troubleshooting

### Redis Connection Errors

**Error:** `Redis Client Error: connect ECONNREFUSED`

**Solution:**
```bash
# Check if Redis is running
redis-cli ping
# Should return PONG

# If not running, start Redis:
# Windows: docker start blazesend-redis
# macOS: brew services start redis
# Linux: sudo systemctl start redis
```

### SMS Not Sending

1. **Check provider credentials** in `.env`
2. **Verify account balance** with your provider
3. **Check sender ID approval** status
4. **Test phone number format** (e.g., `233XXXXXXXXX` for Ghana)

### Email Not Sending

1. **Check SMTP credentials**
2. **Test SMTP connection:**
   ```bash
   telnet smtp.gmail.com 587
   ```
3. **Check firewall rules** (port 587 or 465)
4. **For Gmail:** Ensure you're using an App Password, not your account password

### OTP Rate Limit

**Error:** `Rate limit exceeded. Maximum 3 OTPs per hour.`

**Solution:** Wait 1 hour or manually clear Redis:
```bash
redis-cli
> DEL otp:ratelimit:233XXXXXXXXX
```

## 📊 Architecture

### Provider Interface Design

All SMS and email providers implement standard interfaces (`ISMSProvider`, `IEmailProvider`), making it easy to add new providers or switch between them.

### Service Layer

- **SMSService**: Manages active SMS provider
- **EmailService**: Manages active email provider
- **OTPService**: Handles OTP generation, storage, and verification
- **MessagingService**: Unified interface for all messaging operations

### Redis Storage

OTPs are stored in Redis with the following key structure:
```
otp:{identifier}               # Hashed OTP value
otp:attempts:{identifier}      # Verification attempt counter
otp:ratelimit:{identifier}     # Rate limit counter
```

All keys have TTL (Time To Live) for automatic cleanup.

### Monitoring Redis Data

Use the included Redis viewer to inspect OTP records and rate limits:

```bash
node redis-viewer.js
```

The viewer displays:
- **Active OTPs** - Current OTP hashes with expiration times
- **Verification Attempts** - Wrong attempt counters (0-3)
- **Rate Limits** - Request counts per identifier (0-3 per hour)

**See [REDIS_VIEWER.md](REDIS_VIEWER.md) for detailed documentation.**

**Example Output:**
```
📊 Total Keys: 3

🔐 ACTIVE OTPs:
📱 Identifier: 233555341041
🔒 Hashed OTP: dcb614a0ec27d946...
⏰ Expires in: 9 minutes 37 seconds

⏱️ RATE LIMITS:
📱 233555341041
  OTPs sent: 2/3
  Resets in: 53 minutes
```


## 🔄 Adding New Providers

To add a new SMS provider:

1. Create a class implementing `ISMSProvider`:

```typescript
class NewSMSProvider implements ISMSProvider {
  constructor(config: NewProviderConfig) {
    // Initialize with credentials
  }

  getProviderName(): string {
    return 'NewProvider';
  }

  async sendSMS(to: string, message: string): Promise<SendResult> {
    // Implement API call
  }

  async sendOTP(to: string, otp: string): Promise<SendResult> {
    // Implement OTP-specific message
  }
}
```

2. Add to `SMSService.createProvider()` factory method
3. Add configuration to `.env.example`

## 🚢 Deployment

### Environment Variables (Production)

```bash
NODE_ENV=production
PORT=3000
# Use production Redis with password
REDIS_HOST=your-redis-host
REDIS_PASSWORD=your-redis-password
```

### Docker (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Process Manager (PM2)

```bash
npm install -g pm2
pm2 start npm --name "blazesend" -- start
pm2 save
pm2 startup
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please submit pull requests or open issues.

## 📞 Support

For issues, please open a GitHub issue or contact your team.

---

**Built with ❤️ for reliable messaging in Ghana and beyond.**
