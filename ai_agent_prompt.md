# AI Code Agent Implementation Prompt for BlazeSend

You are an expert full-stack TypeScript developer tasked with implementing a production-ready messaging service called **BlazeSend** based on the provided setup documentation (`blazesend-setup`).

## Your Mission

Implement a complete, working messaging service with the following specifications:

### Core Requirements

1. **Project Setup**
   - Create a TypeScript/Node.js project with proper structure
   - Set up all dependencies as specified in the documentation
   - Configure TypeScript with strict mode enabled
   - Create proper package.json with all required scripts

2. **Core Service Implementation** (`src/messagingService.ts`)
   - Implement the complete messaging service with all provider interfaces
   - Support for SMS providers: Hubtel, Twilio, Mnotify, Arkesel
   - Support for Email providers: SMTP (with extensibility for SendGrid, AWS SES, Mailgun)
   - Implement OTP service with Redis storage
   - Include rate limiting and security features
   - Ensure all providers implement their respective interfaces correctly

3. **Express API Server** (`src/server.ts`)
   - Create RESTful API with all specified endpoints:
     - `GET /health` - Health check with active providers
     - `GET /api/providers` - Get current active providers
     - `POST /api/providers/sms/switch` - Switch SMS provider at runtime
     - `POST /api/sms/send` - Send regular SMS
     - `POST /api/email/send` - Send regular email
     - `POST /api/otp/send` - Send OTP via SMS or email
     - `POST /api/otp/verify` - Verify OTP
   - Implement all validation middleware
   - Add proper error handling
   - Include graceful shutdown logic

4. **Configuration Files**
   - Create `.env.example` with all provider configurations
   - Create `tsconfig.json` with proper compiler options
   - Set up proper `.gitignore`

5. **Documentation**
   - Create a comprehensive README.md with:
     - Project overview
     - Installation instructions
     - Configuration guide for each provider
     - API documentation with examples
     - Provider switching examples
     - Troubleshooting guide

### Technical Specifications

**Architecture Patterns:**
- Use interface-based design for providers
- Implement dependency injection for services
- Follow SOLID principles
- Use async/await for all asynchronous operations

**Security Requirements:**
- Hash OTPs using SHA-256 before storage
- Implement rate limiting (3 OTPs per hour per identifier)
- Limit OTP verification attempts (3 attempts max)
- OTP expiration (10 minutes default)
- Input validation for all endpoints

**Error Handling:**
- Proper try-catch blocks for all async operations
- Meaningful error messages
- Appropriate HTTP status codes
- Graceful degradation

**Code Quality:**
- Full TypeScript type safety
- No `any` types unless absolutely necessary
- Consistent code formatting
- Clear variable and function names
- Comments for complex logic

### Provider Implementation Details

**SMS Providers (implement all 4):**
1. **Hubtel** - Ghana's leading SMS gateway
   - API: `https://smsc.hubtel.com/v1/messages/send`
   - Auth: Basic auth with clientId/clientSecret
   - Payload: `{ From: senderId, To: phone, Content: message }`

2. **Twilio** - International provider
   - API: `https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json`
   - Auth: Basic auth with accountSid/authToken
   - Payload: Form-encoded `From`, `To`, `Body`

3. **Mnotify** - Ghana alternative
   - API: `https://api.mnotify.com/api/sms/quick`
   - Auth: API key in payload
   - Payload: `{ key, to: [phone], msg, sender_id }`

4. **Arkesel** - Another Ghana option
   - API: `https://sms.arkesel.com/api/v2/sms/send`
   - Auth: API key in headers
   - Payload: `{ sender, message, recipients: [phone] }`

**Email Provider:**
- SMTP using nodemailer
- Support TLS/SSL
- HTML and plain text email support
- Professional OTP email template

### File Structure to Create

```
blazesend/
├── src/
│   ├── messagingService.ts    # Core service with all providers
│   ├── server.ts              # Express API
│   └── types/                 # TypeScript type definitions (optional)
│       └── index.ts
├── .env.example               # Environment template
├── .gitignore
├── tsconfig.json
├── package.json
├── README.md
└── LICENSE (optional)
```

### Development Environment Setup

**For Windows Users:**
- Redis requires Docker or WSL2 on Windows
- Recommended: Use Docker Desktop for Windows
- Run: `docker run -d --name blazesend-redis -p 6379:6379 --restart unless-stopped redis:alpine`
- Alternative: Use Redis Cloud (free tier) at https://redis.com/try-free/
- If using Redis Cloud, add `REDIS_PASSWORD` to .env and update Redis client to accept password

**For macOS/Linux Users:**
- Install Redis natively: `brew install redis` (macOS) or `sudo apt install redis-server` (Ubuntu)
- Or use Docker: `docker run -d --name blazesend-redis -p 6379:6379 redis:alpine`

### Step-by-Step Implementation Order

1. **Phase 1: Project Setup**
   - Initialize npm project
   - Install all dependencies
   - Create tsconfig.json
   - Set up basic file structure
   - Set up Redis (Docker recommended for Windows)

2. **Phase 2: Core Service**
   - Define all interfaces (ISMSProvider, IEmailProvider)
   - Implement OTPService with Redis
   - Implement all 4 SMS provider classes
   - Implement SMTP email provider
   - Create SMSService and EmailService (provider managers)
   - Create MessagingService (unified interface)

3. **Phase 3: Express API**
   - Set up Express server with middleware
   - Implement all API routes
   - Add validation middleware
   - Add error handling
   - Test each endpoint

4. **Phase 4: Configuration & Documentation**
   - Create .env.example with all providers
   - Write comprehensive README.md
   - Add inline code comments
   - Create API documentation

5. **Phase 5: Testing & Validation**
   - Test provider switching
   - Test OTP flow (send and verify)
   - Test rate limiting
   - Test error scenarios

### Specific Implementation Notes

**Redis Integration:**
- Use redis package (v4+)
- Connect on first use
- Handle connection errors gracefully
- Implement proper cleanup on shutdown
- **Windows users**: If using Redis Cloud, support password authentication in Redis client config
- **Docker users**: Connection string should be `localhost:6379` (no password needed)

**Provider Switching:**
- Should work without server restart
- Update active provider immediately
- Log provider changes
- Return confirmation with new active provider

**OTP Email Template:**
- Professional HTML design
- Centered layout with 600px max width
- OTP in large, bold, spaced letters
- Clear expiration warning
- Include plain text fallback

**Validation:**
- Ghana phone numbers: `233XXXXXXXXX` format
- Email: Standard email regex
- OTP: Exactly 6 digits
- All required fields checked

### Testing Checklist

After implementation, verify:
- [ ] Server starts without errors
- [ ] Redis connection successful (Docker/WSL2/Cloud)
- [ ] Can send SMS with each provider
- [ ] Can send email via SMTP
- [ ] Can send OTP via SMS
- [ ] Can send OTP via email
- [ ] OTP verification works
- [ ] Invalid OTP rejected
- [ ] Rate limiting works
- [ ] Provider switching works at runtime
- [ ] Health check shows correct providers
- [ ] Graceful shutdown works

**Windows-Specific Testing:**
- [ ] Docker container stays running after PC restart (if using `--restart unless-stopped`)
- [ ] Application connects to Redis without SSL/TLS issues
- [ ] All npm scripts work in PowerShell/Command Prompt

### Environment Variables Template

Create `.env.example` with:
```bash
# Server
PORT=3000
NODE_ENV=development

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
# REDIS_PASSWORD=   # Uncomment if using Redis Cloud or password-protected Redis

# SMS Provider (hubtel|twilio|mnotify|arkesel)
SMS_PROVIDER=hubtel

# Hubtel
HUBTEL_CLIENT_ID=
HUBTEL_CLIENT_SECRET=
HUBTEL_SENDER_ID=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

# Mnotify
MNOTIFY_API_KEY=
MNOTIFY_SENDER_ID=

# Arkesel
ARKESEL_API_KEY=
ARKESEL_SENDER_ID=

# Email Provider (smtp|sendgrid|aws-ses|mailgun)
EMAIL_PROVIDER=smtp

# SMTP
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=BlazeSend
SMTP_USE_TLS=true
```

### Success Criteria

Your implementation will be considered complete when:

1. **Functionality**: All endpoints work as specified
2. **Provider Support**: All 4 SMS providers implemented and switchable
3. **Security**: Rate limiting, OTP hashing, attempt limits work
4. **Code Quality**: TypeScript strict mode, no errors, clean code
5. **Documentation**: Clear README with setup and usage instructions
6. **Error Handling**: Graceful handling of all error scenarios
7. **Production Ready**: Proper logging, validation, graceful shutdown

### API Usage Examples to Include in README

```bash
# Send SMS
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"to": "233241234567", "message": "Hello from BlazeSend!"}'

# Send OTP
curl -X POST http://localhost:3000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"channel": "sms", "identifier": "233241234567", "brandName": "MyApp"}'

# Verify OTP
curl -X POST http://localhost:3000/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"identifier": "233241234567", "otp": "123456"}'

# Switch Provider
curl -X POST http://localhost:3000/api/providers/sms/switch \
  -H "Content-Type: application/json" \
  -d '{"provider": "mnotify", "credentials": {"apiKey": "xxx", "senderId": "Brand"}}'
```

### Additional Context

**Project Name**: BlazeSend  
**Purpose**: Production-ready messaging service for Ghana and international markets  
**Target Users**: Developers who need reliable SMS/Email/OTP services  
**Primary Market**: Ghana (hence Hubtel, Mnotify, Arkesel support)  
**Scalability**: Should handle thousands of messages per hour  

### Questions to Consider

As you implement, think about:
- How to handle provider failures gracefully?
- Should there be automatic fallback to another provider?
- How to log provider performance metrics?
- Should message history be stored?
- How to handle webhook callbacks from providers?

### Deliverables

Provide:
1. Complete working codebase
2. Comprehensive README.md
3. .env.example with all configurations
4. package.json with all scripts
5. Brief implementation notes highlighting:
   - Key architectural decisions
   - Any deviations from the spec (with reasons)
   - Suggestions for future improvements

---

## Instructions for AI Agent

1. Read and understand the entire `blazesend-setup` documentation
2. Follow the implementation order specified above
3. Implement all features as specified
4. Test each component before moving to the next
5. Write clean, production-ready code
6. Document your code inline where complex
7. Create a comprehensive README

**Important**: Do not skip any providers or features. This should be a complete, working implementation ready for production use.

Start with Phase 1 and work through systematically. Good luck!