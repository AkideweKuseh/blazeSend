import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import {
    MessagingService,
    HubtelConfig,
    TwilioConfig,
    MnotifyConfig,
    ArkeselConfig,
    SMTPConfig,
} from './messagingService';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize messaging service
const messagingService = new MessagingService();

// ===========================
// MIDDLEWARE
// ===========================

app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // HTTP logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ===========================
// VALIDATION HELPERS
// ===========================

/**
 * Validate required fields in request body
 */
function validateRequiredFields(
    body: any,
    fields: string[]
): { valid: boolean; message?: string } {
    for (const field of fields) {
        if (!body[field]) {
            return {
                valid: false,
                message: `Missing required field: ${field}`,
            };
        }
    }
    return { valid: true };
}

/**
 * Validate phone number format (basic validation)
 */
function isValidPhone(phone: string): boolean {
    // Allow international format with + or country code
    return /^[\d+]{10,15}$/.test(phone.replace(/\s/g, ''));
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate OTP format (6 digits)
 */
function isValidOTP(otp: string): boolean {
    return /^\d{6}$/.test(otp);
}

// ===========================
// API ROUTES
// ===========================

/**
 * Health Check Endpoint
 */
app.get('/health', (req: Request, res: Response) => {
    const providers = messagingService.getActiveProviders();

    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        providers: {
            sms: providers.sms,
            email: providers.email,
        },
    });
});

/**
 * Get Active Providers
 */
app.get('/api/providers', (req: Request, res: Response) => {
    const providers = messagingService.getActiveProviders();

    res.status(200).json({
        success: true,
        providers,
    });
});

/**
 * Send SMS
 */
app.post('/api/sms/send', async (req: Request, res: Response) => {
    try {
        // Validate required fields
        const validation = validateRequiredFields(req.body, ['to', 'message']);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message,
            });
        }

        const { to, message } = req.body;

        // Validate phone number
        if (!isValidPhone(to)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format',
            });
        }

        // Send SMS
        const result = await messagingService.sendSMS(to, message);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message,
                provider: messagingService.getActiveProviders().sms,
                data: result.data,
            });
        } else {
            res.status(500).json({
                success: false,
                message: result.message,
            });
        }
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: `Server error: ${error.message}`,
        });
    }
});

/**
 * Send Email
 */
app.post('/api/email/send', async (req: Request, res: Response) => {
    try {
        // Validate required fields
        const validation = validateRequiredFields(req.body, ['to', 'subject', 'htmlBody']);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message,
            });
        }

        const { to, subject, htmlBody, textBody } = req.body;

        // Validate email
        if (!isValidEmail(to)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address format',
            });
        }

        // Send email
        const result = await messagingService.sendEmail(
            to,
            subject,
            htmlBody,
            textBody || ''
        );

        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message,
                provider: messagingService.getActiveProviders().email,
                data: result.data,
            });
        } else {
            res.status(500).json({
                success: false,
                message: result.message,
            });
        }
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: `Server error: ${error.message}`,
        });
    }
});

/**
 * Send OTP
 */
app.post('/api/otp/send', async (req: Request, res: Response) => {
    try {
        // Validate required fields
        const validation = validateRequiredFields(req.body, ['channel', 'identifier']);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message,
            });
        }

        const { channel, identifier, brandName } = req.body;

        // Validate channel
        if (channel !== 'sms' && channel !== 'email') {
            return res.status(400).json({
                success: false,
                message: 'Invalid channel. Must be "sms" or "email"',
            });
        }

        // Validate identifier based on channel
        if (channel === 'sms' && !isValidPhone(identifier)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format',
            });
        }

        if (channel === 'email' && !isValidEmail(identifier)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address format',
            });
        }

        // Send OTP
        const result = await messagingService.sendOTP(channel, identifier, brandName);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message,
            });
        } else {
            res.status(429).json({
                success: false,
                message: result.message,
            });
        }
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: `Server error: ${error.message}`,
        });
    }
});

/**
 * Verify OTP
 */
app.post('/api/otp/verify', async (req: Request, res: Response) => {
    try {
        // Validate required fields
        const validation = validateRequiredFields(req.body, ['identifier', 'otp']);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message,
            });
        }

        const { identifier, otp } = req.body;

        // Validate OTP format
        if (!isValidOTP(otp)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP format. Must be 6 digits',
            });
        }

        // Verify OTP
        const result = await messagingService.verifyOTP(identifier, otp);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message,
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message,
            });
        }
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: `Server error: ${error.message}`,
        });
    }
});

/**
 * Switch SMS Provider at Runtime
 */
app.post('/api/providers/sms/switch', (req: Request, res: Response) => {
    try {
        // Validate required fields
        const validation = validateRequiredFields(req.body, ['provider', 'credentials']);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message,
            });
        }

        const { provider, credentials } = req.body;

        // Switch provider
        const result = messagingService.switchSMSProvider({ provider, credentials });

        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message,
                activeProvider: result.data?.activeProvider,
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message,
            });
        }
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: `Server error: ${error.message}`,
        });
    }
});

// ===========================
// ERROR HANDLING
// ===========================

/**
 * 404 Handler
 */
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
    });
});

/**
 * Global Error Handler
 */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);

    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    });
});

// ===========================
// SERVER INITIALIZATION
// ===========================

/**
 * Load SMS provider configuration from environment
 */
function loadSMSProviderConfig(): { provider: string; credentials: any } | null {
    const provider = process.env.SMS_PROVIDER;

    if (!provider) return null;

    switch (provider.toLowerCase()) {
        case 'hubtel':
            return {
                provider: 'hubtel',
                credentials: {
                    clientId: process.env.HUBTEL_CLIENT_ID,
                    clientSecret: process.env.HUBTEL_CLIENT_SECRET,
                    senderId: process.env.HUBTEL_SENDER_ID,
                } as HubtelConfig,
            };

        case 'twilio':
            return {
                provider: 'twilio',
                credentials: {
                    accountSid: process.env.TWILIO_ACCOUNT_SID,
                    authToken: process.env.TWILIO_AUTH_TOKEN,
                    fromNumber: process.env.TWILIO_FROM_NUMBER,
                } as TwilioConfig,
            };

        case 'mnotify':
            return {
                provider: 'mnotify',
                credentials: {
                    apiKey: process.env.MNOTIFY_API_KEY,
                    senderId: process.env.MNOTIFY_SENDER_ID,
                } as MnotifyConfig,
            };

        case 'arkesel':
            return {
                provider: 'arkesel',
                credentials: {
                    apiKey: process.env.ARKESEL_API_KEY,
                    senderId: process.env.ARKESEL_SENDER_ID,
                } as ArkeselConfig,
            };

        default:
            return null;
    }
}

/**
 * Load Email provider configuration from environment
 */
function loadEmailProviderConfig(): { provider: string; credentials: any } | null {
    const provider = process.env.EMAIL_PROVIDER;

    if (!provider) return null;

    if (provider.toLowerCase() === 'smtp') {
        return {
            provider: 'smtp',
            credentials: {
                host: process.env.SMTP_HOST || 'localhost',
                port: parseInt(process.env.SMTP_PORT || '587'),
                username: process.env.SMTP_USERNAME,
                password: process.env.SMTP_PASSWORD,
                fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@example.com',
                fromName: process.env.SMTP_FROM_NAME || 'BlazeSend',
                useTLS: process.env.SMTP_USE_TLS === 'true',
            } as SMTPConfig,
        };
    }

    return null;
}

/**
 * Start server
 */
async function startServer() {
    try {
        console.log('🚀 Starting BlazeSend Messaging Service...\n');

        // Initialize messaging service
        await messagingService.initialize({
            redis: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
                db: parseInt(process.env.REDIS_DB || '0'),
                password: process.env.REDIS_PASSWORD,
                username: process.env.REDIS_USERNAME,
            },
            sms: loadSMSProviderConfig() || undefined,
            email: loadEmailProviderConfig() || undefined,
        });

        // Start Express server
        app.listen(PORT, () => {
            console.log(`\n✅ BlazeSend server running on port ${PORT}`);
            console.log(`📍 Health check: http://localhost:${PORT}/health\n`);

            const providers = messagingService.getActiveProviders();
            console.log('Active Providers:');
            console.log(`  📱 SMS: ${providers.sms}`);
            console.log(`  📧 Email: ${providers.email}\n`);
        });
    } catch (error: any) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// ===========================
// GRACEFUL SHUTDOWN
// ===========================

async function gracefulShutdown(signal: string) {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    try {
        await messagingService.cleanup();
        console.log('✅ Cleanup completed');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error during cleanup:', error.message);
        process.exit(1);
    }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start the server
startServer();
