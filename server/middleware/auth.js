import jwt from 'jsonwebtoken';
import crypto from 'crypto';

let JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️ WARNING: JWT_SECRET not set in production! Generating temporary secret.');
        console.warn('   Sessions will be invalidated on server restart.');
        JWT_SECRET = crypto.randomBytes(32).toString('hex');
    } else {
        JWT_SECRET = 'super-secret-dev-key';
    }
}

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token.' });
        }
        req.user = user;
        next();
    });
}
