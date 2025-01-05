import request from 'supertest';
import Server from '../server';
import jwt from 'jsonwebtoken';

const app = new Server().getApp();
let adminToken: string, userToken: string;

beforeAll(async () => {
  const adminRes = await request(app)
    .post('/login')
    .send({ email: 'admin@example.com', password: 'adminpass' });
  adminToken = adminRes.body.token;

  const userRes = await request(app)
    .post('/login')
    .send({ email: 'john@example.com', password: 'password123' });
  userToken = userRes.body.token;
});

describe('Role-Based Access Control', () => {
  it('should allow admin to delete a task', async () => {
    const res = await request(app)
      .delete('/tasks/1')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Task deleted successfully');
  });

  it('should prevent regular user from deleting a task', async () => {
    const res = await request(app)
      .delete('/tasks/2')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toBe('Access denied');
  });
});
