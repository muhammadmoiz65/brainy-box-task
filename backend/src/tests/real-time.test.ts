import { io as Client } from 'socket.io-client';
import request from 'supertest';
import Server from '../server';
import sequelize from '../config/db';

const app = new Server();
app.start();

describe('Real-Time Updates', () => {
  let clientSocket: any;

  beforeAll((done) => {
    clientSocket = Client(`http://localhost:${app['port']}`);
    clientSocket.on('connect', done);
  });
  afterAll(async () => {
    await sequelize.close();
    app['httpServer'].close();
  });

  it('should receive taskCreated event', (done) => {
    clientSocket.on('taskCreated', (data: any) => {
      expect(data).toHaveProperty('title', 'Test Task');
      done();
    });

    request(app.getApp())
      .post('/tasks')
      .send({ title: 'Test Task', description: 'Real-time test', status: 'Pending', deadline: '2023-12-31', assigned_user: 1 });
  });
});
