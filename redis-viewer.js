// Redis Data Viewer - See OTP records in Redis
require('dotenv').config();
const { createClient } = require('redis');

async function viewRedisData() {
    const client = createClient({
        socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379')
        },
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        database: parseInt(process.env.REDIS_DB || '0')
    });

    client.on('error', (err) => console.error('Redis Error:', err));

    try {
        await client.connect();
        console.log('✅ Connected to Redis Cloud\n');

        // Get all keys
        const allKeys = await client.keys('*');

        if (allKeys.length === 0) {
            console.log('📭 No keys found in Redis (all OTPs have been verified/expired)\n');
            console.log('ℹ️  Generate a new OTP to see records appear here.');
        } else {
            console.log(`📊 Total Keys: ${allKeys.length}\n`);
            console.log('='.repeat(60));

            // Group keys by type
            const otpKeys = allKeys.filter(k => k.startsWith('otp:') && !k.includes('attempts') && !k.includes('ratelimit'));
            const attemptKeys = allKeys.filter(k => k.includes('attempts'));
            const rateLimitKeys = allKeys.filter(k => k.includes('ratelimit'));

            // Display OTP Keys
            if (otpKeys.length > 0) {
                console.log('\n🔐 ACTIVE OTPs:');
                console.log('='.repeat(60));
                for (const key of otpKeys) {
                    const value = await client.get(key);
                    const ttl = await client.ttl(key);
                    const identifier = key.replace('otp:', '');

                    console.log(`\n📱 Identifier: ${identifier}`);
                    console.log(`🔒 Hashed OTP: ${value.substring(0, 16)}...`);
                    console.log(`⏰ Expires in: ${Math.floor(ttl / 60)} minutes ${ttl % 60} seconds`);
                }
            }

            // Display Attempt Counters
            if (attemptKeys.length > 0) {
                console.log('\n\n🔢 VERIFICATION ATTEMPTS:');
                console.log('='.repeat(60));
                for (const key of attemptKeys) {
                    const attempts = await client.get(key);
                    const ttl = await client.ttl(key);
                    const identifier = key.replace('otp:attempts:', '');

                    console.log(`\n📱 ${identifier}`);
                    console.log(`   Attempts: ${attempts}/3`);
                    console.log(`   Resets in: ${Math.floor(ttl / 60)} minutes`);
                }
            }

            // Display Rate Limits
            if (rateLimitKeys.length > 0) {
                console.log('\n\n⏱️  RATE LIMITS:');
                console.log('='.repeat(60));
                for (const key of rateLimitKeys) {
                    const count = await client.get(key);
                    const ttl = await client.ttl(key);
                    const identifier = key.replace('otp:ratelimit:', '');

                    console.log(`\n📱 ${identifier}`);
                    console.log(`   OTPs sent: ${count}/3`);
                    console.log(`   Resets in: ${Math.floor(ttl / 60)} minutes`);
                }
            }

            console.log('\n' + '='.repeat(60));
        }

        await client.quit();
        console.log('\n✅ Disconnected from Redis\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the viewer
viewRedisData();
