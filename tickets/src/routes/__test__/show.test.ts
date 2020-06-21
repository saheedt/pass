import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { getCookie } from '../../test/auth-helper';

it('returns 4040 if the ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app).get(`/api/v1/tickets/${id}`)
    .send()
    .expect(404);
});

it('returns the ticket if it found', async () => {
  const title = "concert";
  const price = 200;
  
  const response = await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', getCookie())
    .send({ title, price })
    .expect(201)
  
  const ticketResponse = await request(app)
    .get(`/api/v1/tickets/${response.body.id}`)
    .send()
    .expect(200);
  
  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});