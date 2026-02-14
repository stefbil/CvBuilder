import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '7d';

function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// Register
router.post('/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if user already exists
        const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (existing) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }

        // Create user
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                name: name || '',
            },
        });

        const token = generateToken(user.id);

        res.status(201).json({
            token,
            user: { id: user.id, email: user.email, name: user.name },
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: err.message || 'Registration failed' });
    }
});

// Login
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user.id);

        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user
router.get('/auth/me', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, name: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (err) {
        console.error('Auth/me error:', err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

export default router;
