import request from 'supertest';
import { app } from '../../app';

it('should return 400 if unknown email is supplied', async () => {
  await request(app)
    .post('/api/v1/users/signin')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(404);
});

it('should return 400 if incorrect password is supplied', async () => {
  await request(app)
    .post('/api/v1/users/signup')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(201);
  
  await request(app)
    .post('/api/v1/users/signin')
    .send({ email: 'test@test.com', password: 'pjhvgcjgfgj' })
    .expect(400);
});

it('should respond with a cookie when valid credentials are supplied', async () => {
  await request(app)
    .post('/api/v1/users/signup')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(201);

  const response = await request(app)
    .post('/api/v1/users/signin')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(200);
  
  expect(response.get('Set-Cookie')).toBeDefined();
});