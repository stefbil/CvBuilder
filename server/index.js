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

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, '../dist');

console.log('Static file path:', distPath);
import fs from 'fs';
if (fs.existsSync(distPath)) {
    console.log('Dist directory contents:', fs.readdirSync(distPath));
} else {
    console.error('Dist directory does not exist!');
}

// Serve static files from the dist directory
app.use(express.static(distPath));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/resumes', resumesRouter);

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
    const indexPath = join(__dirname, '../dist/index.html');
    if (!fs.existsSync(indexPath)) {
        console.error('Index file not found at:', indexPath);
        return res.status(404).send('Index file not found (server misconfiguration)');
    }
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(500).send('Error serving app');
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Serving static files from: ${distPath}`);
});
