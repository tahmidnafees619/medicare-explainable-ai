import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.userId = decoded.userId;
  next();
}

export function corsHeaders(req: Request, res: Response, next: NextFunction) {
  // Security headers
  res.header('X-Content-Type-Options', 'nosniff'); // Prevent MIME type sniffing
  res.header('X-Frame-Options', 'DENY'); // Prevent clickjacking
  res.header('X-XSS-Protection', '1; mode=block'); // XSS protection
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains'); // HSTS
  res.header('Content-Security-Policy', "default-src 'self'"); // CSP
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
}
