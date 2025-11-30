# Redis Data Viewer

A utility script to inspect OTP records and rate limits stored in your Redis database.

## 📋 Overview

The Redis Viewer connects to your Redis instance and displays:
- **Active OTPs** - Currently stored OTP hashes with expiration times
- **Verification Attempts** - Wrong attempt counters for each identifier
- **Rate Limits** - OTP request counts and reset timers

## 🚀 Usage

### Basic Usage

Simply run the script from your project directory:

```bash
node redis-viewer.js
```

### Example Output

```
✅ Connected to Redis Cloud

📊 Total Keys: 3

============================================================

🔐 ACTIVE OTPs:
============================================================

📱 Identifier: 233555341041
🔒 Hashed OTP: dcb614a0ec27d946...
⏰ Expires in: 9 minutes 37 seconds

🔢 VERIFICATION ATTEMPTS:
============================================================

📱 233555341041
   Attempts: 0/3
   Resets in: 9 minutes

⏱️  RATE LIMITS:
============================================================

📱 233555341041
   OTPs sent: 2/3
   Resets in: 53 minutes

============================================================

✅ Disconnected from Redis
```

## 🔑 Configuration

The script automatically reads Redis credentials from your `.env` file:

```bash
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=your-password
REDIS_DB=0
```

**No hardcoded credentials!** All sensitive information is loaded from environment variables.

## 📊 What You'll See

### 1. Active OTPs

Shows currently stored OTP hashes (not plain text):

- **Identifier** - Phone number or email
- **Hashed OTP** - First 16 characters of SHA-256 hash
- **Expiration** - Time until OTP expires (default: 10 minutes)

**Note:** The actual OTP code is never stored in Redis, only its hash.

### 2. Verification Attempts

Tracks failed verification attempts:

- **Attempts Counter** - Shows X/3 (max 3 attempts)
- **Reset Timer** - When the counter resets
- **Purpose** - Prevents brute force attacks

After 3 failed attempts, the OTP is automatically deleted.

### 3. Rate Limits

Monitors OTP request frequency:

- **Request Counter** - Shows X/3 (max 3 OTPs per hour)
- **Reset Timer** - When you can request more OTPs
- **Purpose** - Prevents spam and abuse

## 🧪 Testing Scenarios

### Scenario 1: View Active OTP

1. Generate an OTP:
   ```bash
   curl -X POST http://localhost:9090/api/otp/send \
     -H "Content-Type: application/json" \
     -d '{"channel": "sms", "identifier": "233555341041"}'
   ```

2. View it immediately:
   ```bash
   node redis-viewer.js
   ```

3. You'll see the OTP hash, attempts counter (0/3), and rate limit (1/3)

### Scenario 2: After Successful Verification

1. Verify the OTP:
   ```bash
   curl -X POST http://localhost:9090/api/otp/verify \
     -H "Content-Type: application/json" \
     -d '{"identifier": "233555341041", "otp": "123456"}'
   ```

2. View Redis again:
   ```bash
   node redis-viewer.js
   ```

3. You'll see:
   - ✅ OTP hash **deleted**
   - ✅ Attempts counter **deleted**
   - ⏱️ Rate limit **still active** (resets in ~60 min)

### Scenario 3: Rate Limit Testing

1. Send 3 OTPs quickly
2. Run viewer after each:
   ```bash
   node redis-viewer.js
   ```

3. Watch the counter increment: 1/3 → 2/3 → 3/3
4. Try sending a 4th OTP - you'll get an error

## 🔐 Security Features Visible

### SHA-256 Hashing
```
🔒 Hashed OTP: dcb614a0ec27d946...
```
- Only the hash is stored, never the plain OTP
- Impossible to reverse-engineer the actual code

### Auto-Expiration
```
⏰ Expires in: 9 minutes 37 seconds
```
- Default: 10 minutes
- Keys automatically deleted when expired
- Redis TTL (Time To Live) enforced

### Attempt Limiting
```
Attempts: 0/3
```
- Maximum 3 verification attempts
- After 3 failures, OTP is deleted
- Prevents brute force attacks

### Rate Limiting
```
OTPs sent: 2/3
Resets in: 53 minutes
```
- Maximum 3 OTP requests per hour
- Per identifier (phone/email)
- Prevents spam and abuse

## 🛠️ Troubleshooting

### "Redis not connected" Error

**Problem:** Can't connect to Redis

**Solutions:**
1. Check your `.env` file has correct credentials
2. Verify Redis instance is running
3. Test connection manually:
   ```bash
   redis-cli -h your-host -p your-port -a your-password ping
   ```

### Empty Database

**Problem:** "No keys found in Redis"

**This is normal if:**
- All OTPs have been verified (auto-cleanup)
- OTPs have expired (10-minute TTL)
- No OTPs have been generated yet

**To see data:**
Generate a new OTP and run the viewer immediately.

### Connection Timeout

**Problem:** Redis Cloud connection times out

**Cause:** Free tier databases can pause after inactivity

**Solution:** Just run the viewer again - it will auto-reconnect

## 📝 Redis Key Structure

BlazeSend uses this key naming convention:

| Key Pattern | Purpose | TTL | Example |
|-------------|---------|-----|---------|
| `otp:{identifier}` | Hashed OTP | 10 min | `otp:233555341041` |
| `otp:attempts:{identifier}` | Attempt counter | 10 min | `otp:attempts:233555341041` |
| `otp:ratelimit:{identifier}` | Rate limit counter | 1 hour | `otp:ratelimit:233555341041` |

Each OTP flow creates **3 keys** in Redis.

## 🔄 Lifecycle Example

```
1. User requests OTP
   └─> 3 keys created in Redis

2. User enters correct OTP
   └─> OTP key deleted
   └─> Attempts key deleted
   └─> Rate limit key remains (1 hour)

3. 10 minutes pass (no verification)
   └─> OTP key expires & deleted
   └─> Attempts key expires & deleted
   └─> Rate limit key remains

4. 1 hour passes since first request
   └─> Rate limit key expires & deleted
   └─> Redis is clean
```

## 💡 Best Practices

1. **Monitor During Development**
   - Run viewer after each OTP operation
   - Verify keys are created/deleted as expected
   - Check TTL values are correct

2. **Production Monitoring**
   - Set up Redis monitoring dashboards
   - Track key counts and memory usage
   - Monitor rate limit patterns

3. **Security**
   - Never commit `.env` file to Git
   - Use strong Redis passwords
   - Enable Redis authentication

## 🚀 Advanced Usage

### Custom Queries

You can modify `redis-viewer.js` to add custom queries:

```javascript
// Get all keys matching pattern
const otpKeys = await client.keys('otp:*');

// Get specific key value
const value = await client.get('otp:233555341041');

// Get key TTL
const ttl = await client.ttl('otp:233555341041');
```

### Integration with Monitoring Tools

Export data for external monitoring:

```bash
# Output to JSON
node redis-viewer.js > redis-data.json

# Schedule periodic checks (cron)
*/5 * * * * cd /path/to/blazeSend && node redis-viewer.js >> redis-log.txt
```

## 📚 Related Documentation

- [README.md](README.md) - Main project documentation
- [TESTING.md](TESTING.md) - API testing guide
- [IMPLEMENTATION_NOTES.md](IMPLEMENTATION_NOTES.md) - Architecture details

## 🤝 Contributing

To improve the viewer:

1. Fork the repository
2. Modify `redis-viewer.js`
3. Test with real Redis data
4. Submit a pull request

---

**Made with ❤️ for BlazeSend**
