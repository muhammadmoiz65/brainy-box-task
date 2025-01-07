import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import sequelize from './config/db';
import AuthController from './controller/AuthController';
import { authenticateToken } from './middleware/authMiddleware';
import { authorizeRole } from './middleware/roleMiddleware';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { login, getAllUsers } from './controller/AuthController';
import User from './models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Task from './models/Task';
import multer from 'multer';
import path from 'path';
import Role from './models/Role';
import PermissionSet from './models/PermissionSet';
import { checkPermission } from './middleware/checkPermission';
import { CustomJwtPayload } from './types/customJwtPayload';
import { Op } from 'sequelize';

dotenv.config();

class Server {
  private app: Application;
  private port: number | string;
  private httpServer: HttpServer;
  private io: SocketServer;

  constructor() {
    this.app = express();
    this.port = 8080;
    this.httpServer = createServer(this.app);

    this.io = new SocketServer(this.httpServer, {
      cors: {
        origin: '*',
        credentials: true,
      },
    });

    this.middlewares();
    this.socketSetup();
    this.routes();
    this.database();
    this.errorHandler();
  }

  private middlewares() {
    this.app.use(cors({ origin: '*', credentials: true }));
    this.app.use(express.json());
    this.app.use(morgan('dev'));
  }

  private wrapAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch(next);
    };
  };

  private socketSetup() {
    this.io.on('connection', (socket) => {
      console.log('A user connected');

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });
  }

  public getApp(): Application {
    return this.app;
  }
  

  private routes() {

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set the directory for file uploads
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9); // Generate a unique suffix
        const fileExt = path.extname(file.originalname); // Extract file extension
        cb(null, `attachment-${uniqueSuffix}${fileExt}`); // Set the new filename
      },
    });

    // Initialize multer with the custom storage
    const upload = multer({ storage });


    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    this.app.get('/protected', authenticateToken, (req: Request, res: Response) => {
      res.json({ message: 'This is a protected route!', user: (req as any).user });
    });
    this.app.post('/tasks/:id/upload', upload.single('attachment'), async (req: Request<{ id: string }>, res: Response): Promise<void> => {
      try {
          const taskId = req.params.id;
          const task = await Task.findByPk(taskId);
    
          if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
          }
          task.attachment_url = (req.file?.filename || '');
          await task.save();
    
          res.status(200).json({ message: 'Attachment uploaded successfully', task });
        } catch (error) {
          console.error('Error uploading attachment:', error);
          res.status(500).json({ error: 'Failed to upload attachment' });
        }
      }
    );

    
    this.app.put('/users/role', authenticateToken,
      
      checkPermission({ resource: '/users/role', action: 'PUT' }), 

      this.wrapAsync(this.assignRoleToUser)); 

    this.app.get(  '/users',
      authenticateToken,
      checkPermission({ resource: '/users', action: 'GET' }), 
      getAllUsers); 
    
    /*

    [
  "GET",
  "POST",
  "PUT",
  "DELETE"
]

    */
    this.app.post(
      '/users',
      authenticateToken,
      checkPermission({ resource: '/users', action: 'POST' }), 
      async (req, res): Promise<void> => {
      try {
        const { name, email, password, role } = req.body;
    
        if (!name || !email || !password || !role) {
          res.status(400).json({ message: 'All fields are required' });
          return;
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashedPassword, role });
    
        res.status(201).json({ message: 'User created successfully' });
      } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Failed to create user' });
      }
    });

    this.app.post ('/roles', this.wrapAsync(this.addRole));
    this.app.get  ('/roles', this.wrapAsync(this.fetchRoles));
    this.app.post ('/roles/assign', this.wrapAsync(this.assignRoleToUser));
    this.app.post ('/roles/permissions', this.wrapAsync(this.updatePermissions));

    this.app.post('/register', this.wrapAsync(AuthController.register));
    this.app.post('/login', this.wrapAsync(login));

    this.app.post('/tasks', authenticateToken,checkPermission({ resource: '/tasks', action: 'POST' }), this.wrapAsync(this.createTask));
    this.app.get('/tasks', authenticateToken,checkPermission({ resource: '/tasks', action: 'GET' }),  async (req: Request, res: Response) => {
      try {
        const { role, id: userId } = (req as any).user; // Assuming token provides role and user ID
        let tasks;
        
   
        


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
            resource: '/tasks',
            permissions: {
              [Op.contains]: 'ADMIN' ,
            },
          },
        });
        console.log("sdf23fwdfwefdsfwdf ADMIN MODE " + hasPermission);


        if (hasPermission) {
          tasks = await Task.findAll();
        } else {
          tasks = await Task.findAll({ where: { assigned_user: userId } });
        }





        res.status(200).json(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Failed to fetch tasks' });
      }
    });    
    this.app.get('/tasks', authenticateToken,checkPermission({ resource: '/tasks', action: 'GET' }), this.wrapAsync(this.getTaskById));
    this.app.put('/tasks/:id', authenticateToken,checkPermission({ resource: '/tasks', action: 'PUT' }), this.wrapAsync(this.updateTask));
    this.app.delete('/tasks/:id', authenticateToken,checkPermission({ resource: '/tasks/id', action: 'DELETE' }),  this.wrapAsync(this.deleteTask));
  }

  private addRole = async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      const role = await Role.create({ name });
      res.status(201).json({ message: 'Role created successfully', role });
    } catch (error) {
      console.error('Error adding role:', error);
      res.status(500).json({ message: 'Failed to create role' });
    }
  };

  private fetchRoles = async (_req: Request, res: Response) => {
    try {
      const roles = await Role.findAll();
      res.status(200).json(roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ message: 'Failed to fetch roles' });
    }
  };
  

  private assignRoleToUser = async (req: Request, res: Response) => {
    try {
      const { userId, roleId } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.role = roleId;
      await user.save();

      res.status(200).json({ message: 'Role assigned successfully', user });
    } catch (error) {
      console.error('Error assigning role:', error);
      res.status(500).json({ message: 'Failed to assign role' });
    }
  };


  private updatePermissions = async (req: Request, res: Response) => {
    try {
      const { roleId, permissions }: { roleId: number; permissions: Record<string, Record<string, boolean>> } = req.body;
      const role_id = roleId;
  
      await PermissionSet.destroy({ where: { role_id } });
  
      const newPermissions = Object.entries(permissions).flatMap(([endpoint, actions]) =>
        Object.entries(actions).map(([action, allowed]) => ({
          role_id,
          resource: endpoint,
          permissions: permissions,
        }))
      );
      await PermissionSet.bulkCreate(newPermissions);
  
      res.status(200).json({ message: 'Permissions updated successfully' });
    } catch (error) {
      console.error('Error updating permissions:', error);
      res.status(500).json({ message: 'Failed to update permissions' });
    }
  };
  

  private createTask = async (req: Request, res: Response) => {
    const { title, description, status, deadline, assigned_user } = req.body;
    const task = await Task.create({ title, description, status, deadline, assigned_user });

    this.io.emit('taskCreated', task);
    res.status(201).json({ message: 'Task created successfully', task });
  };

  private getAllTasks = async (req: Request, res: Response) => {
    const tasks = await Task.findAll();
    res.json(tasks);
  };

  private getTaskById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  };

  private updateTask = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, status, deadline, assigned_user } = req.body;
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await task.update({ title, description, status, deadline, assigned_user });
    this.io.emit('taskUpdated', task);
    res.json({ message: 'Task updated successfully', task });
  };

  private deleteTask = async (req: Request, res: Response) => {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await task.destroy();
    this.io.emit('taskDeleted', { id });
    res.json({ message: 'Task deleted successfully' });
  };

  private async database() {
    try {
      await sequelize.authenticate();
      console.log('Database connected successfully.');
      await sequelize.sync({ force: process.env.NODE_ENV !== 'production' });
      console.log('Database synced successfully.');

      console.log('Seeding database...');
      await this.seedDatabase();
      console.log('Database seeded successfully.');
    } catch (err) {
      console.error('Database connection failed:', err);
    }
  }
  private async seedDatabase() {
    const hashedPassword = await bcrypt.hash('password123', 10);
  
    // Seed Roles
    const roles = await Role.bulkCreate([
      { name: 'Admin' },
      { name: 'Editor' },
      { name: 'Viewer' },
    ]);
  
    // Seed Users
    const users = await User.bulkCreate([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: '1',
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        role: '2',
      },
    ]);
  
    // Seed Tasks
    await Task.bulkCreate([
      {
        title: 'Create UI',
        description: 'Description for Task 1',
        status: 'Pending',
        deadline: '2023-12-31',
        assigned_user: users[0].id,
      },
      {
        title: 'Create Documentation',
        description: 'Description for Task 1',
        status: 'Pending',
        deadline: '2023-12-31',
        assigned_user: users[0].id,
      },
      {
        title: 'Perform tests',
        description: 'Description for Task 1',
        status: 'Pending',
        deadline: '2023-12-31',
        assigned_user: users[0].id,
      },
      {
        title: 'Deploy to cloud',
        description: 'Description for Task 1',
        status: 'Pending',
        deadline: '2023-12-31',
        assigned_user: users[1].id,
      },
      {
        title: 'Meeting with Moiz',
        description: 'Description for Task 2',
        status: 'In Progress',
        deadline: '2023-12-25',
        assigned_user: users[1].id,
      },
    ]);
  
    // Seed PermissionSets
    await PermissionSet.bulkCreate([
      {
        role_id: roles[0].id, // Admin
        resource: '/tasks',
        permissions: ['GET', 'POST', 'PUT', 'DELETE', 'ADMIN'],
      },
      {
        role_id: roles[0].id, // Admin
        resource: '/users',
        permissions: ['GET', 'POST', 'PUT', 'DELETE'],
      },   
      {
        role_id: roles[1].id, // Admin
        resource: '/users',
        permissions: ['GET', 'POST', 'PUT', 'DELETE'],
      },
      {
        role_id: roles[1].id, // Editor
        resource: '/tasks',
        permissions: ['GET', 'POST', 'PUT'],
      },
      {
        role_id: roles[2].id, // Viewer
        resource: '/tasks',
        permissions: ['GET'],
      },
    ]);
  }

  private errorHandler() {
    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error(err.stack);
      res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
    });
  }

  public start() {
    this.httpServer.listen(parseInt(this.port as string, 10), '0.0.0.0', () => {
      console.log(`Server is running on http://0.0.0.0:${this.port}`);
    });
  }
}

export default Server;
