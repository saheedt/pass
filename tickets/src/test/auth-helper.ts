import request from 'supertest';
import { app } from '../app';

export const getCookie = async () => {
  const email = 'test@test.com';
  const password = 'password';

  const response = await request(app)
    .post('/api/v1/users/signup')
    .send({ email, password })
    .expect(201);
  
  const cookie = response.get('Set-Cookie');
  return cookie;
};