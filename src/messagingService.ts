import axios from 'axios';
import nodemailer from 'nodemailer';
import { createClient } from 'redis';
import crypto from 'crypto';

// ===========================
// TYPES AND INTERFACES
// ===========================

export interface SendResult {
    success: boolean;
    message: string;
    data?: any;
}

export interface ISMSProvider {
    getProviderName(): string;
    sendSMS(to: string, message: string): Promise<SendResult>;
    sendOTP(to: string, otp: string): Promise<SendResult>;
}

export interface IEmailProvider {
    getProviderName(): string;
    sendEmail(
        to: string,
        subject: string,
        htmlBody: string,
        textBody: string
    ): Promise<SendResult>;
    sendOTP(to: string, otp: string, brandName?: string): Promise<SendResult>;
}

// Provider Configuration Types
export interface HubtelConfig {
    clientId: string;
    clientSecret: string;
    senderId: string;
}

export interface TwilioConfig {
    accountSid: string;
    authToken: string;
    fromNumber: string;
}

export interface MnotifyConfig {
    apiKey: string;
    senderId: string;
}

export interface ArkeselConfig {
    apiKey: string;
    senderId: string;
}

export interface SMTPConfig {
    host: string;
    port: number;
    username?: string;
    password?: string;
    fromEmail: string;
    fromName: string;
    useTLS: boolean;
}

// ===========================
// SMS PROVIDER IMPLEMENTATIONS
// ===========================

/**
 * Hubtel SMS Provider - Ghana's leading SMS gateway
 */
export class HubtelProvider implements ISMSProvider {
    private config: HubtelConfig;

    constructor(config: HubtelConfig) {
        this.config = config;
    }

    getProviderName(): string {
        return 'Hubtel';
    }

    async sendSMS(to: string, message: string): Promise<SendResult> {
        try {
            const auth = Buffer.from(
                `${this.config.clientId}:${this.config.clientSecret}`
            ).toString('base64');

            const response = await axios.post(
                'https://smsc.hubtel.com/v1/messages/send',
                {
                    From: this.config.senderId,
                    To: to,
                    Content: message,
                },
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return {
                success: true,
                message: 'SMS sent successfully via Hubtel',
                data: response.data,
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Hubtel Error: ${error.response?.data?.message || error.message}`,
            };
        }
    }

    async sendOTP(to: string, otp: string): Promise<SendResult> {
        const message = `Your verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
        return this.sendSMS(to, message);
    }
}

/**
 * Twilio SMS Provider - International provider
 */
export class TwilioProvider implements ISMSProvider {
    private config: TwilioConfig;

    constructor(config: TwilioConfig) {
        this.config = config;
    }

    getProviderName(): string {
        return 'Twilio';
    }

    async sendSMS(to: string, message: string): Promise<SendResult> {
        try {
            const auth = Buffer.from(
                `${this.config.accountSid}:${this.config.authToken}`
            ).toString('base64');

            const params = new URLSearchParams();
            params.append('From', this.config.fromNumber);
            params.append('To', to);
            params.append('Body', message);

            const response = await axios.post(
                `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`,
                params,
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            return {
                success: true,
                message: 'SMS sent successfully via Twilio',
                data: response.data,
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Twilio Error: ${error.response?.data?.message || error.message}`,
            };
        }
    }

    async sendOTP(to: string, otp: string): Promise<SendResult> {
        const message = `Your verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
        return this.sendSMS(to, message);
    }
}

/**
 * Mnotify SMS Provider - Ghana alternative
 */
export class MnotifyProvider implements ISMSProvider {
    private config: MnotifyConfig;

    constructor(config: MnotifyConfig) {
        this.config = config;
    }

    getProviderName(): string {
        return 'Mnotify';
    }

    async sendSMS(to: string, message: string): Promise<SendResult> {
        try {
            const response = await axios.post(
                'https://api.mnotify.com/api/sms/quick',
                {
                    key: this.config.apiKey,
                    to: [to],
                    msg: message,
                    sender_id: this.config.senderId,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            return {
                success: true,
                message: 'SMS sent successfully via Mnotify',
                data: response.data,
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Mnotify Error: ${error.response?.data?.message || error.message}`,
            };
        }
    }

    async sendOTP(to: string, otp: string): Promise<SendResult> {
        const message = `Your verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
        return this.sendSMS(to, message);
    }
}

/**
 * Arkesel SMS Provider - Ghana SMS provider
 */
export class ArkeselProvider implements ISMSProvider {
    private config: ArkeselConfig;

    constructor(config: ArkeselConfig) {
        this.config = config;
    }

    getProviderName(): string {
        return 'Arkesel';
    }

    async sendSMS(to: string, message: string): Promise<SendResult> {
        try {
            // Arkesel uses query parameters, not JSON body
            const params = new URLSearchParams({
                action: 'send-sms',
                api_key: this.config.apiKey,
                to: to,
                from: this.config.senderId,
                sms: message,
            });

            const response = await axios.get(
                `https://sms.arkesel.com/sms/api?${params.toString()}`
            );

            // Arkesel returns text response like "Successfully Sent" or JSON with status
            const responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

            if (responseText.includes('Successfully') || responseText.includes('success') ||
                response.data?.code === '200' || response.data?.status === 'success') {
                return {
                    success: true,
                    message: 'SMS sent successfully via Arkesel',
                    data: response.data,
                };
            } else {
                return {
                    success: false,
                    message: `Arkesel Error: ${response.data?.message || responseText}`,
                };
            }
        } catch (error: any) {
            return {
                success: false,
                message: `Arkesel Error: ${error.response?.data?.message || error.message}`,
            };
        }
    }

    async sendOTP(to: string, otp: string): Promise<SendResult> {
        const message = `Your verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
        return this.sendSMS(to, message);
    }
}

// ===========================
// EMAIL PROVIDER IMPLEMENTATION
// ===========================

/**
 * SMTP Email Provider using nodemailer
 */
export class SMTPProvider implements IEmailProvider {
    private config: SMTPConfig;
    private transporter: nodemailer.Transporter;

    constructor(config: SMTPConfig) {
        this.config = config;
        this.transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.port === 465, // true for 465, false for other ports
            auth:
                config.username && config.password
                    ? {
                        user: config.username,
                        pass: config.password,
                    }
                    : undefined,
        });
    }

    getProviderName(): string {
        return 'SMTP';
    }

    async sendEmail(
        to: string,
        subject: string,
        htmlBody: string,
        textBody: string
    ): Promise<SendResult> {
        try {
            const info = await this.transporter.sendMail({
                from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
                to: to,
                subject: subject,
                text: textBody,
                html: htmlBody,
            });

            return {
                success: true,
                message: 'Email sent successfully via SMTP',
                data: { messageId: info.messageId },
            };
        } catch (error: any) {
            return {
                success: false,
                message: `SMTP Error: ${error.message}`,
            };
        }
    }

    async sendOTP(to: string, otp: string, brandName = 'BlazeSend'): Promise<SendResult> {
        const htmlBody = this.generateOTPEmailHTML(otp, brandName);
        const textBody = `Your ${brandName} verification code is: ${otp}\n\nThis code will expire in 10 minutes.\nDo not share this code with anyone.`;

        return this.sendEmail(to, `${brandName} - Verification Code`, htmlBody, textBody);
    }

    private generateOTPEmailHTML(otp: string, brandName: string): string {
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">${brandName}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; text-align: center;">Verification Code</h2>
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 24px; text-align: center;">
                Please use the following code to complete your verification:
              </p>
              
              <!-- OTP Display -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; display: inline-block;">
                      <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">
                        ${otp}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 20px; text-align: center;">
                This code will expire in <strong>10 minutes</strong>.
              </p>
              <p style="margin: 10px 0 0 0; color: #999999; font-size: 13px; line-height: 18px; text-align: center;">
                If you didn't request this code, please ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                This is an automated message from ${brandName}. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
    }
}

// ===========================
// OTP SERVICE WITH REDIS
// ===========================

export class OTPService {
    private redisClient: ReturnType<typeof createClient> | null = null;
    private readonly OTP_EXPIRY = 600; // 10 minutes in seconds
    private readonly MAX_ATTEMPTS = 3;
    private readonly RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds
    private readonly MAX_OTP_PER_HOUR = 3;

    async connect(redisConfig: {
        host: string;
        port: number;
        db: number;
        password?: string;
        username?: string;
    }): Promise<void> {
        if (this.redisClient) return;

        this.redisClient = createClient({
            socket: {
                host: redisConfig.host,
                port: redisConfig.port,
            },
            username: redisConfig.username,
            password: redisConfig.password,
            database: redisConfig.db,
        });

        this.redisClient.on('error', (err) => console.error('Redis Client Error:', err));

        await this.redisClient.connect();
        console.log('✅ Connected to Redis');
    }

    async disconnect(): Promise<void> {
        if (this.redisClient) {
            await this.redisClient.quit();
            this.redisClient = null;
        }
    }

    /**
     * Generate a 6-digit OTP
     */
    generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Hash OTP using SHA-256
     */
    private hashOTP(otp: string): string {
        return crypto.createHash('sha256').update(otp).digest('hex');
    }

    /**
     * Check rate limit for OTP requests
     */
    async checkRateLimit(identifier: string): Promise<{ allowed: boolean; message?: string }> {
        if (!this.redisClient) throw new Error('Redis not connected');

        const rateLimitKey = `otp:ratelimit:${identifier}`;
        const count = await this.redisClient.get(rateLimitKey);

        if (count && parseInt(count) >= this.MAX_OTP_PER_HOUR) {
            return {
                allowed: false,
                message: 'Rate limit exceeded. Maximum 3 OTPs per hour.',
            };
        }

        return { allowed: true };
    }

    /**
     * Increment rate limit counter
     */
    private async incrementRateLimit(identifier: string): Promise<void> {
        if (!this.redisClient) throw new Error('Redis not connected');

        const rateLimitKey = `otp:ratelimit:${identifier}`;
        const current = await this.redisClient.get(rateLimitKey);

        if (!current) {
            await this.redisClient.setEx(rateLimitKey, this.RATE_LIMIT_WINDOW, '1');
        } else {
            await this.redisClient.incr(rateLimitKey);
        }
    }

    /**
     * Store OTP in Redis with expiration
     */
    async storeOTP(identifier: string, otp: string): Promise<void> {
        if (!this.redisClient) throw new Error('Redis not connected');

        const hashedOTP = this.hashOTP(otp);
        const otpKey = `otp:${identifier}`;
        const attemptsKey = `otp:attempts:${identifier}`;

        // Store hashed OTP
        await this.redisClient.setEx(otpKey, this.OTP_EXPIRY, hashedOTP);

        // Reset attempts counter
        await this.redisClient.setEx(attemptsKey, this.OTP_EXPIRY, '0');

        // Increment rate limit
        await this.incrementRateLimit(identifier);
    }

    /**
     * Verify OTP
     */
    async verifyOTP(identifier: string, otp: string): Promise<{ valid: boolean; message: string }> {
        if (!this.redisClient) throw new Error('Redis not connected');

        const otpKey = `otp:${identifier}`;
        const attemptsKey = `otp:attempts:${identifier}`;

        // Check if OTP exists
        const storedHash = await this.redisClient.get(otpKey);
        if (!storedHash) {
            return {
                valid: false,
                message: 'OTP expired or not found',
            };
        }

        // Check attempts
        const attemptsStr = await this.redisClient.get(attemptsKey);
        const attempts = attemptsStr ? parseInt(attemptsStr) : 0;

        if (attempts >= this.MAX_ATTEMPTS) {
            // Delete OTP after max attempts
            await this.redisClient.del(otpKey);
            await this.redisClient.del(attemptsKey);

            return {
                valid: false,
                message: 'Maximum verification attempts exceeded',
            };
        }

        // Verify OTP
        const hashedInput = this.hashOTP(otp);

        if (hashedInput === storedHash) {
            // Valid OTP - clean up
            await this.redisClient.del(otpKey);
            await this.redisClient.del(attemptsKey);

            return {
                valid: true,
                message: 'OTP verified successfully',
            };
        } else {
            // Invalid OTP - increment attempts
            await this.redisClient.incr(attemptsKey);

            const remainingAttempts = this.MAX_ATTEMPTS - (attempts + 1);
            return {
                valid: false,
                message: `Invalid OTP. ${remainingAttempts} attempt(s) remaining`,
            };
        }
    }
}

// ===========================
// SMS SERVICE MANAGER
// ===========================

export class SMSService {
    private activeProvider: ISMSProvider | null = null;

    setProvider(provider: ISMSProvider): void {
        this.activeProvider = provider;
        console.log(`📱 SMS Provider set to: ${provider.getProviderName()}`);
    }

    getActiveProviderName(): string {
        return this.activeProvider?.getProviderName() || 'None';
    }

    async sendSMS(to: string, message: string): Promise<SendResult> {
        if (!this.activeProvider) {
            return {
                success: false,
                message: 'No SMS provider configured',
            };
        }

        return this.activeProvider.sendSMS(to, message);
    }

    async sendOTP(to: string, otp: string): Promise<SendResult> {
        if (!this.activeProvider) {
            return {
                success: false,
                message: 'No SMS provider configured',
            };
        }

        return this.activeProvider.sendOTP(to, otp);
    }

    /**
     * Factory method to create provider from configuration
     */
    static createProvider(
        providerName: string,
        credentials: any
    ): ISMSProvider | null {
        switch (providerName.toLowerCase()) {
            case 'hubtel':
                return new HubtelProvider(credentials as HubtelConfig);
            case 'twilio':
                return new TwilioProvider(credentials as TwilioConfig);
            case 'mnotify':
                return new MnotifyProvider(credentials as MnotifyConfig);
            case 'arkesel':
                return new ArkeselProvider(credentials as ArkeselConfig);
            default:
                return null;
        }
    }
}

// ===========================
// EMAIL SERVICE MANAGER
// ===========================

export class EmailService {
    private activeProvider: IEmailProvider | null = null;

    setProvider(provider: IEmailProvider): void {
        this.activeProvider = provider;
        console.log(`📧 Email Provider set to: ${provider.getProviderName()}`);
    }

    getActiveProviderName(): string {
        return this.activeProvider?.getProviderName() || 'None';
    }

    async sendEmail(
        to: string,
        subject: string,
        htmlBody: string,
        textBody: string
    ): Promise<SendResult> {
        if (!this.activeProvider) {
            return {
                success: false,
                message: 'No email provider configured',
            };
        }

        return this.activeProvider.sendEmail(to, subject, htmlBody, textBody);
    }

    async sendOTP(to: string, otp: string, brandName?: string): Promise<SendResult> {
        if (!this.activeProvider) {
            return {
                success: false,
                message: 'No email provider configured',
            };
        }

        return this.activeProvider.sendOTP(to, otp, brandName);
    }
}

// ===========================
// UNIFIED MESSAGING SERVICE
// ===========================

export class MessagingService {
    private smsService: SMSService;
    private emailService: EmailService;
    private otpService: OTPService;

    constructor() {
        this.smsService = new SMSService();
        this.emailService = new EmailService();
        this.otpService = new OTPService();
    }

    /**
     * Initialize the messaging service
     */
    async initialize(config: {
        redis: { host: string; port: number; db: number; password?: string; username?: string };
        sms?: { provider: string; credentials: any };
        email?: { provider: string; credentials: any };
    }): Promise<void> {
        // Connect to Redis
        await this.otpService.connect(config.redis);

        // Initialize SMS provider if configured
        if (config.sms) {
            const smsProvider = SMSService.createProvider(
                config.sms.provider,
                config.sms.credentials
            );
            if (smsProvider) {
                this.smsService.setProvider(smsProvider);
            }
        }

        // Initialize Email provider if configured
        if (config.email?.provider === 'smtp') {
            const emailProvider = new SMTPProvider(config.email.credentials);
            this.emailService.setProvider(emailProvider);
        }
    }

    /**
     * Cleanup resources
     */
    async cleanup(): Promise<void> {
        await this.otpService.disconnect();
    }

    /**
     * Send SMS
     */
    async sendSMS(to: string, message: string): Promise<SendResult> {
        return this.smsService.sendSMS(to, message);
    }

    /**
     * Send Email
     */
    async sendEmail(
        to: string,
        subject: string,
        htmlBody: string,
        textBody: string
    ): Promise<SendResult> {
        return this.emailService.sendEmail(to, subject, htmlBody, textBody);
    }

    /**
     * Send OTP via SMS or Email
     */
    async sendOTP(
        channel: 'sms' | 'email',
        identifier: string,
        brandName?: string
    ): Promise<SendResult> {
        // Check rate limit
        const rateLimitCheck = await this.otpService.checkRateLimit(identifier);
        if (!rateLimitCheck.allowed) {
            return {
                success: false,
                message: rateLimitCheck.message!,
            };
        }

        // Generate OTP
        const otp = this.otpService.generateOTP();

        // Store OTP
        await this.otpService.storeOTP(identifier, otp);

        // 🔥 DEVELOPMENT MODE: Log OTP to console
        if (process.env.NODE_ENV === 'development') {
            console.log('\n' + '='.repeat(50));
            console.log('🔐 OTP GENERATED (Development Mode)');
            console.log('='.repeat(50));
            console.log(`📱 To: ${identifier}`);
            console.log(`🔢 OTP: ${otp}`);
            console.log(`⏰ Expires in: 10 minutes`);
            console.log(`📊 Channel: ${channel}`);
            console.log('='.repeat(50) + '\n');
        }

        // Send OTP via chosen channel
        let result: SendResult;
        if (channel === 'sms') {
            result = await this.smsService.sendOTP(identifier, otp);
        } else {
            result = await this.emailService.sendOTP(identifier, otp, brandName);
        }

        if (result.success) {
            return {
                success: true,
                message: `OTP sent successfully via ${channel}`,
            };
        } else {
            return result;
        }
    }

    /**
     * Verify OTP
     */
    async verifyOTP(identifier: string, otp: string): Promise<SendResult> {
        const result = await this.otpService.verifyOTP(identifier, otp);

        return {
            success: result.valid,
            message: result.message,
        };
    }

    /**
     * Switch SMS provider at runtime
     */
    switchSMSProvider(config: { provider: string; credentials: any }): SendResult {
        const provider = SMSService.createProvider(config.provider, config.credentials);

        if (!provider) {
            return {
                success: false,
                message: `Unknown SMS provider: ${config.provider}`,
            };
        }

        this.smsService.setProvider(provider);

        return {
            success: true,
            message: `Switched to ${provider.getProviderName()}`,
            data: { activeProvider: provider.getProviderName() },
        };
    }

    /**
     * Get active providers
     */
    getActiveProviders(): { sms: string; email: string } {
        return {
            sms: this.smsService.getActiveProviderName(),
            email: this.emailService.getActiveProviderName(),
        };
    }
}
