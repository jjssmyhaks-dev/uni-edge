import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';
import { config } from '../config';

/**
 * Clerk authentication middleware.
 * Verifies the JWT token from the Authorization header
 * and attaches decoded user data to req.user.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.slice(7);

    const payload = await verifyToken(token, {
      secretKey: config.clerk.secretKey,
    });

    // Set user on the request (types augmented globally)
    req.user = {
      sub: payload.sub as string,
      institution_id: (payload.institution_id as string) || null,
      role: (payload.role as string) || 'applicant',
      department_id: (payload.department_id as string) || null,
      email: (payload.email as string) || undefined,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
