import request from 'supertest';
import { app } from '../../app';
import { getCookie } from '../../test/auth-helper';

const createTicket = () => { 
  return request(app)
    .post('/api/v1/tickets')
    .set('Cookie', getCookie())
    .send({
      title: 'adjsd',
      price: 10
    });
};

it('should fetch a list of tickets', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = request(app)
    .get('/api/v1/tickets')
    .set('Cookie', getCookie())
    .send()
    .expect(200);
  
  expect((await response).body.length).toEqual(3)
});