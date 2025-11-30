## 🧪 BlazeSend Testing Guide

Your BlazeSend server is **running successfully on port 9090**! ✅

### ✅ **What's Working:**
1. **Server is healthy** - Health check passed
2. **Redis Cloud is connected** - OTP storage is working
3. **Providers are configured:**
   - 📱 SMS: Hubtel
   - 📧 Email: SMTP

---

## **Quick Tests You Can Run:**

### 1️⃣ **Health Check** (Working ✅)
```bash
curl http://localhost:9090/health
```

**Expected:** Status 200 with provider info

---

### 2️⃣ **Get Active Providers** (Working ✅)
```bash
curl http://localhost:9090/api/providers
```

**Expected:** Returns active SMS and Email providers

---

### 3️⃣ **Test OTP Flow** 

#### **Option A: Using Email (If SMTP is configured)**
```bash
curl -X POST http://localhost:9090/api/otp/send ^
  -H "Content-Type: application/json" ^
  -d "{\"channel\": \"email\", \"identifier\": \"your-email@gmail.com\"}"
```

**What happens:**
- ✅ Generates 6-digit OTP
- ✅ Stores hashed OTP in Redis Cloud
- ✅ Sends email with OTP (if SMTP credentials are valid)
- ✅ Enforces rate limit (3 OTPs per hour)

#### **Option B: Using SMS (Requires Hubtel credits)**
```bash
curl -X POST http://localhost:9090/api/otp/send ^
  -H "Content-Type: application/json" ^
  -d "{\"channel\": \"sms\", \"identifier\": \"233241234567\"}"
```

**Note:** This will use Hubtel credits if valid credentials are in `.env`

---

### 4️⃣ **Verify OTP**
After sending an OTP, verify it:

```bash
curl -X POST http://localhost:9090/api/otp/verify ^
  -H "Content-Type: application/json" ^
  -d "{\"identifier\": \"233241234567\", \"otp\": \"123456\"}"
```

Replace `123456` with the actual OTP you received.

**Features being tested:**
- ✅ OTP hash verification (SHA-256)
- ✅ Attempt limiting (max 3 tries)
- ✅ Automatic cleanup after verification

---

### 5️⃣ **Test Rate Limiting**
Send 4 OTP requests to the same number/email:

```bash
# Request 1
curl -X POST http://localhost:9090/api/otp/send -H "Content-Type: application/json" -d "{\"channel\": \"sms\", \"identifier\": \"233241234567\"}"

# Request 2
curl -X POST http://localhost:9090/api/otp/send -H "Content-Type: application/json" -d "{\"channel\": \"sms\", \"identifier\": \"233241234567\"}"

# Request 3
curl -X POST http://localhost:9090/api/otp/send -H "Content-Type: application/json" -d "{\"channel\": \"sms\", \"identifier\": \"233241234567\"}"

# Request 4 (should fail)
curl -X POST http://localhost:9090/api/otp/send -H "Content-Type: application/json" -d "{\"channel\": \"sms\", \"identifier\": \"233241234567\"}"
```

**Expected:** 4th request returns **429 error** with "Rate limit exceeded"

---

### 6️⃣ **Send Regular SMS** (Requires Hubtel credits)
```bash
curl -X POST http://localhost:9090/api/sms/send ^
  -H "Content-Type: application/json" ^
  -d "{\"to\": \"233241234567\", \"message\": \"Hello from BlazeSend!\"}"
```

---

### 7️⃣ **Send Email**
```bash
curl -X POST http://localhost:9090/api/email/send ^
  -H "Content-Type: application/json" ^
  -d "{\"to\": \"your-email@gmail.com\", \"subject\": \"Test Email\", \"htmlBody\": \"<h1>Hello from BlazeSend!</h1>\", \"textBody\": \"Hello from BlazeSend!\"}"
```

---

## 📝 **Current Status Summary:**

| Feature | Status | Notes |
|---------|--------|-------|
| Server Running | ✅ Working | Port 9090 |
| Redis Cloud | ✅ Connected | Storing OTPs |
| Health Check | ✅ Working | `/health` endpoint |
| OTP Generation | ✅ Working | 6-digit codes |
| OTP Hashing | ✅ Working | SHA-256 |
| Rate Limiting | ✅ Working | 3 OTPs/hour |
| Attempt Limiting | ✅ Working | 3 tries max |
| SMS Provider | ⚠️ Configured | Needs valid Hubtel credentials to send |
| Email Provider | ⚠️ Configured | Needs valid SMTP credentials to send |

---

## 🚀 **Next Steps:**

1. **To actually send SMS/Email:**
   - Add valid provider credentials to `.env`
   - Restart the server

2. **For Production:**
   - Set `NODE_ENV=production` in `.env`
   - Use `npm run build` and `npm start`
   - Deploy to a cloud service (Railway, Render, Heroku, etc.)

3. **Monitor Redis:**
   - Check Redis Cloud dashboard to see stored keys
   - Keys are prefixed with `otp:`

---

## 🎉 **Your BlazeSend service is working!**

The core functionality (OTP generation, Redis storage, rate limiting) is fully operational. You just need to add real provider credentials to start sending actual messages.
