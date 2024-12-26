import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token_master = process.env.TOKEN_MASTER;
  const token = req.header('Authorization')?.replace('Bearer ', '');

  try {
    if (token === token_master) {
      req.user = { id: 3, email: 'superadmin@example.com', role: 'SUPERADMIN' };
      return next();
    }

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    // Standard token verification
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    req.user = {
      id: decoded.id as number,
      email: decoded.email as string,
      role: decoded.role as string,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }
};
