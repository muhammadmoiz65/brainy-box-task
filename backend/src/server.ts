import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import sequelize from './config/db';
import AuthController from './controller/AuthController';
import { authenticateToken } from './middleware/authMiddleware';
import Task from './models/Task';
import { authorizeRole } from './middleware/roleMiddleware';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { login, getAllUsers } from './controller/AuthController';
import User from './models/User';
import bcrypt from 'bcrypt';

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
    this.app.get('/protected', authenticateToken, (req: Request, res: Response) => {
      res.json({ message: 'This is a protected route!', user: (req as any).user });
    });
    this.app.get('/users', authenticateToken, getAllUsers); 

    this.app.post('/register', this.wrapAsync(AuthController.register));
    this.app.post('/login', this.wrapAsync(login));

    this.app.post('/tasks', authenticateToken, authorizeRole('Admin'), this.wrapAsync(this.createTask));
    this.app.get('/tasks', authenticateToken, this.wrapAsync(this.getAllTasks));
    this.app.get('/tasks/:id', authenticateToken, this.wrapAsync(this.getTaskById));
    this.app.put('/tasks/:id', authenticateToken, authorizeRole('Admin'), this.wrapAsync(this.updateTask));
    this.app.delete('/tasks/:id', authenticateToken, authorizeRole('Admin'), this.wrapAsync(this.deleteTask));
  }

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
    const users = await User.bulkCreate([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'Admin',
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'User',
      },
    ]);

    await Task.bulkCreate([
      {
        title: 'Task 1',
        description: 'Description for Task 1',
        status: 'Pending',
        deadline: '2023-12-31',
        assigned_user: users[1].id,
      },
      {
        title: 'Task 2',
        description: 'Description for Task 2',
        status: 'In Progress',
        deadline: '2023-12-25',
        assigned_user: users[1].id,
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
