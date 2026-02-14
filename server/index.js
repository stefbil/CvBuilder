import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRouter from './routes/auth.js';
import resumesRouter from './routes/resumes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS — restrict in production
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

// Rate limiting on auth routes
import rateLimit from 'express-rate-limit';
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 attempts per window
    message: { error: 'Too many attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

// API Routes
app.use('/api', authRouter);
app.use('/api', resumesRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// In production, serve the built frontend
if (process.env.NODE_ENV === 'production') {
    const distPath = join(__dirname, '..', 'dist');
    app.use(express.static(distPath));
    // SPA Fallback: serve index.html for any other request
    app.use((req, res) => {
        res.sendFile(join(distPath, 'index.html'));
    });
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
