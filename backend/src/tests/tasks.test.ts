import request from 'supertest';
import Server from '../server';

const app = new Server().getApp();
let token: string;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/login')
    .send({ email: 'john@example.com', password: 'password123' });
  token = loginRes.body.token;

  const jwt = require('jsonwebtoken');
  console.log('Task endpoint token payload:', jwt.decode(token));
});

describe('Task Endpoints', () => {
  it('should create a new task', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Task', description: 'Test Description', status: 'Pending', deadline: '2023-12-31', assigned_user: 1 });
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe('Task created successfully');
  });
});
