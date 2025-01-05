import { Request, Response, NextFunction } from 'express';

export const authorizeRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user || user.role !== role) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    next();
  };
};
