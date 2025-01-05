# Task Management System

This project provides **Task Management System** comprising a **backend** (Node.js, Sequelize, PostgreSQL) and a **frontend** (React, Vite, Material-UI). It includes required features such as user authentication, task management, real-time updates via WebSocket, and role-based access control.

---

## Features

1. **Authentication & Authorization**
   - JWT-based authentication.
   - Two Roles (Admin/User).

2. **Task Management**
   - CRUD operations for tasks.
   - ONLY ADMIN - UPDATE - Assign tasks to users.
   - ONLY ADMIN - UPDATE - Set deadlines and Set statuses (Pending, In Progress, Completed).

3. **Real-time Updates**
   - WebSocket integration for task creation, updates, and deletion.

4. **Database**
   - PostgreSQL with Sequelize ORM.
   - Models:
     - User
     - Task

5. **Seeding & Migration**
   - Seeders for initial data (users and tasks).
   - Database migrations.

6. **Frontend**
   - React-based frontend using Vite.
   - Material-UI for components.
   - Real-time UI updates.

7. **Dockerized Setup**
   - Separate Docker configurations for test, and production.
   - Docker Compose to connect backend, frontend, database, and WebSocket.

---

## Project Structure

### Backend
- **Controllers**
  - `AuthController`: Handles user authentication (register, login).
  - `TaskController`: Handles task CRUD operations.

- **Middlewares**
  - `authMiddleware`: Verifies JWT.
  - `roleMiddleware`: Ensures user has appropriate role for specific actions.

- **Models**
  - `User`: Stores user details.
  - `Task`: Stores task details (title, description, status, deadline, assigned user).

- **Seeders**
  - `users`: Creates initial admin and user accounts.
  - `tasks`: Creates initial sample tasks.

- **APIs**
  - `/register`: Register a new user.
  - `/login`: Authenticate and retrieve a JWT.
  - `/tasks`: CRUD operations for tasks.

- **Sockets**
  - `taskCreated`: Broadcasts when a task is created.
  - `taskUpdated`: Broadcasts when a task is updated.
  - `taskDeleted`: Broadcasts when a task is deleted.

---

### Frontend
- **Components**
  - `Navbar`: Navigation bar.
  - `TaskList`: Displays all tasks with real-time updates.
  - `TaskForm`: Allows creation and updating of tasks.

- **State Management**
  - Local component states for managing form inputs and task lists.
  - Real-time updates using WebSocket events.

- **Endpoints**
  - `ENDPOINTS.TASKS`: Task-related APIs.
  - `ENDPOINTS.USERS`: User-related APIs.
  - `ENDPOINTS.LOGIN`: For login.
  - `ENDPOINTS.REGISTER`: For registration of users.

---

## Database Schema

### Tables and Relationships

1. **Users Table**
   - `id`: Primary key.
   - `name`: User's name.
   - `email`: User's email (unique).
   - `password`: Hashed password.
   - `role`: Role (Admin/User).

2. **Tasks Table**
   - `id`: Primary key.
   - `title`: Task title.
   - `description`: Task description.
   - `status`: Task status (Pending, In Progress, Completed).
   - `deadline`: Task deadline.
   - `assigned_user`: Foreign key to `Users` table.

---

## Scripts

### Backend Scripts
- `npm start`: Start the backend server.
- `npm run build`: Build the JS bundle.

### Frontend Scripts
- `npm start`: Start the frontend development server.
- `npm run build`: Build the frontend for production.
- `npm run preview`: Preview the production build locally.

---

## Running Locally

### Prerequisites
- Node.js
- Docker (optional for containerized setup)
- PostgreSQL

### Steps

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd task-management-system
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your configuration
   npm start
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Update .env with your API URL and WebSocket URL
   npm start
   ```

---

## Running with Docker Compose

1. **Build and Run Services**:
   ```bash
   docker-compose up --build
   ```

2. **Services**:
   - Backend: `http://localhost:8080`
   - Frontend: `http://localhost:3000`
   - Database: PostgreSQL running on `localhost:5432`

---

## Deployment

### Production Deployment Steps

1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Run Docker Compose for Production**:
   ```bash
   docker-compose up --build
   ```

### Environment Variables
- `DATABASE_URL`: Connection string for the PostgreSQL database.
- `VITE_API_URL`: Base API URL for the frontend.
- `VITE_SOCKET_URL`: WebSocket URL for real-time updates.
- `JWT_SECRET`: Secret key for JWT.

---

## Real-time Integration

1. **Backend**:
   - Emits events (`taskCreated`, `taskUpdated`, `taskDeleted`) via WebSocket.

2. **Frontend**:
   - Listens to WebSocket events and updates the task list dynamically.

---

## Testing

1. **Run Tests**:
   ```bash
   npm run test
   ```

2. **Testing Setup**:
   - Backend uses `Jest` for unit and integration tests.
   - Ensure the test database is configured in `.env.test`.

---

## Future Enhancements

- Implement notification system.
- Add audit logs for task changes.
- Introduce user activity tracking.
- Enhance UI/UX with animations and themes.

---

### Note
The UI isn't the best, but I hope it is sufficient to showcase the functionality :)
