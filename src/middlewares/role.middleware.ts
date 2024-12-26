import { Request, Response, NextFunction } from 'express';

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user?.role)) {
      res
        .status(403)
        .json({ message: 'Access denied: Insufficient permissions' });
      return;
    }
    next();
  };
};
