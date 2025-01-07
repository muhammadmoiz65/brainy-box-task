import request from 'supertest';
import Server from '../server';
import sequelize from '../config/db';

const app = new Server().getApp();

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Reset database before tests
});

afterAll(async () => {
  await sequelize.close();
});

describe('Authentication Endpoints', () => {
  const testUser = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'User',
  };

  it('should register a new user successfully', async () => {
    const res = await request(app).post('/register').send(testUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
    expect(res.body.user).toMatchObject({
      name: testUser.name,
      email: testUser.email,
      role: testUser.role,
    });
  });

  it('should fail to register a user with the same email', async () => {
    const res = await request(app).post('/register').send(testUser);
    expect(res.statusCode).toEqual(500); 
    expect(res.body).toHaveProperty('message', 'Email already exists');
  });

  it('should login a user and return a token', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should fail to login with incorrect password', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: testUser.email, password: 'wrongpassword' });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid email or password');
  });

  it('should fail to login with non-existent email', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'nonexistent@example.com', password: 'password123' });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid email or password');
  });
});
