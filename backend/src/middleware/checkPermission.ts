import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomJwtPayload } from '../types/customJwtPayload'; // Adjust path as needed
import PermissionSet from '../models/PermissionSet'; // Adjust path as needed
import { Op } from 'sequelize';

export const checkPermission = (requiredPermission: { resource: string; action: string }) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ message: 'No token provided' });
        return;
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CustomJwtPayload;

      const roleId = decoded.role;
      
      const hasPermission = await PermissionSet.findOne({
        where: {
          role_id: roleId,
          resource: requiredPermission.resource,
          permissions: {
            [Op.contains]: requiredPermission.action ,
          },
        },
      });

      if (!hasPermission) {
        res.status(403).json({ message: 'Insufficient permissions' });
        return;
      }

      next();
    } catch (error) {
      console.error('Error in checkPermission middleware:', error);
      res.status(500).json({ message: 'Failed to verify permissions' });
    }
  };
};
