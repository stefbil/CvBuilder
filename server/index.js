import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import resumesRouter from './routes/resumes.js';
import authRouter from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/resumes', resumesRouter);

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
