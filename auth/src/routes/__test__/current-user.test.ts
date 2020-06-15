import request from 'supertest';
import { app } from '../../app';
import { getCookie } from '../../test/auth-helper';

it('should respond with details about the current user', async () => {
  const cookie = await getCookie();
  
  const response = await request(app)
    .get('/api/v1/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);
  
  expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('should respond with null if not authenticated', async () => {
  const response = await await request(app)
    .get('/api/v1/users/currentuser')
    .send()
    .expect(200);
  
  expect(response.body.currentUser).toEqual(null);
})