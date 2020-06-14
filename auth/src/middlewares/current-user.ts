import { Request, Response, NextFunction } from 'express';

import { JwtManager } from '../services/jwt-manager';

interface UserPaylaod {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPaylaod;
    }
  }
}

export const currentUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.jwt) {
    return next();
  }

  try {
    const payload = JwtManager.verifyToken(req.session.jwt) as UserPaylaod;
    req.currentUser = payload;
  } catch (error) {}
  next();
};
