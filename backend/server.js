const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Resend } = require('resend');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Resend
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey && resendApiKey !== 'your_resend_api_key_here' ? new Resend(resendApiKey) : null;

// CORS configuration
const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// Lightweight IP-based rate limiter to protect contact endpoint
const rateLimitMap = new Map();
const contactRateLimiter = (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 3; // Limit to 3 requests per minute per IP

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, []);
    }

    const requestTimestamps = rateLimitMap.get(ip).filter(timestamp => now - timestamp < windowMs);
    requestTimestamps.push(now);
    rateLimitMap.set(ip, requestTimestamps);

    if (requestTimestamps.length > maxRequests) {
        return res.status(429).json({
            success: false,
            message: 'Too many contact submissions. Please wait a minute and try again.'
        });
    }

    next();
};

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Contact API is running.'
    });
});

// Contact form API route
app.post('/api/contact', contactRateLimiter, async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // 1. Validation & sanitization
        const trimmedName = name ? name.trim() : '';
        const trimmedEmail = email ? email.trim() : '';
        const trimmedSubject = subject ? subject.trim() : '';
        const trimmedMessage = message ? message.trim() : '';

        if (!trimmedName || !trimmedEmail || !trimmedSubject || !trimmedMessage) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            });
        }

        // Email validation pattern
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address.'
            });
        }

        // 2. Spam protection: max lengths check
        if (trimmedName.length > 100) {
            return res.status(400).json({ success: false, message: 'Name must be 100 characters or less.' });
        }
        if (trimmedEmail.length > 254) {
            return res.status(400).json({ success: false, message: 'Email must be 254 characters or less.' });
        }
        if (trimmedSubject.length > 200) {
            return res.status(400).json({ success: false, message: 'Subject must be 200 characters or less.' });
        }
        if (trimmedMessage.length > 5000) {
            return res.status(400).json({ success: false, message: 'Message must be 5000 characters or less.' });
        }

        // 3. Environment configuration validation
        if (!resend) {
            console.error('Resend API key is not configured.');
            return res.status(500).json({
                success: false,
                message: 'Unable to send message right now.'
            });
        }

        const recipients = [
            process.env.CONTACT_EMAIL_1,
            process.env.CONTACT_EMAIL_2
        ].filter(emailStr => emailStr && emailStr.includes('@') && !emailStr.includes('example.com'));

        if (recipients.length === 0) {
            console.error('No valid recipient emails configured in process.env.');
            return res.status(500).json({
                success: false,
                message: 'Unable to send message right now.'
            });
        }

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

        // 4. Send email using Resend
        const emailResult = await resend.emails.send({
            from: fromEmail,
            to: recipients,
            replyTo: trimmedEmail,
            subject: `New Portfolio Contact: ${trimmedSubject}`,
            text: `New message received from your portfolio.\n\nName:\n${trimmedName}\n\nEmail:\n${trimmedEmail}\n\nSubject:\n${trimmedSubject}\n\nMessage:\n${trimmedMessage}`,
            html: `
                <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                    <h2>New message received from your portfolio.</h2>
                    <p><strong>Name:</strong><br>${trimmedName}</p>
                    <p><strong>Email:</strong><br>${trimmedEmail}</p>
                    <p><strong>Subject:</strong><br>${trimmedSubject}</p>
                    <p><strong>Message:</strong><br>${trimmedMessage.replace(/\n/g, '<br>')}</p>
                </div>
            `
        });

        if (emailResult.error) {
            console.error('Resend API Error:', emailResult.error);
            return res.status(500).json({
                success: false,
                message: 'Unable to send message.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Message sent successfully.'
        });

    } catch (error) {
        console.error('Unhandled Server Error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to send message.'
        });
    }
});

// Start Express server
app.listen(PORT, () => {
    console.log(`Server successfully started. Listening on port ${PORT}`);
});
