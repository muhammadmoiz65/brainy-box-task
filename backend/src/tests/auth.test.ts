import request from 'supertest';
import Server from '../server';

const app = new Server().getApp();

describe('Authentication Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/register')
      .send({ name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'User' });
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  it('should login a user and return a token', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'john@example.com', password: 'password123' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});
