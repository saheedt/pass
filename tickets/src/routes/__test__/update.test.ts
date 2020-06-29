import request from 'supertest'
import mongoose from 'mongoose';
import { app } from '../../app';
import { getCookie } from '../../test/auth-helper';
import { natsClientWrapper } from '../../nats-client-wrapper';
import { Ticket } from '../../db/models/ticket';

it('returns a 404 if provided id doesnt exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/v1/tickets/${id}`)
    .set('Cookie', getCookie())
    .send({ title: 'asfjfjd', price: 40 })
    .expect(404);
});

it('returns a 401 if user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/v1/tickets/${id}`)
    .send({ title: 'asfjfjd', price: 40 })
    .expect(401);
});

it('returns a 401 if user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', getCookie())
    .send({ title: 'addsdd', price: 44 });
  
  await request(app)
    .put(`/api/v1/tickets/${response.body.id}`)
    .set('Cookie', getCookie())
    .send({ title: 'faill', price: 30 })
    .expect(401);
  
  const getResponse = await request(app)
    .get(`/api/v1/tickets/${response.body.id}`)
    .send()
    .expect(200);
  
  expect(getResponse.body.title).toEqual(response.body.title);
  
});

it('returns a 400 if user provides an invalid title or price', async () => {
  const cookie = getCookie();
  const response = await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', cookie)
    .send({ title: 'addsdd', price: 44 });
  
  await request(app)
    .put(`/api/v1/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 33 })
    .expect(400);
  
  await request(app)
    .put(`/api/v1/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'enkad', price: -22 })
    .expect(400);
});

it('updates the ticket if supplied inputs are valid', async () => {
  const cookie = getCookie();
  const response = await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', cookie)
    .send({ title: 'addsdd', price: 44 });
  
  await request(app)
    .put(`/api/v1/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'win', price: 100 })
    .expect(200);
  
  const updatedResp = await request(app)
    .get(`/api/v1/tickets/${response.body.id}`)
    .send()
    .expect(200);
  
  expect(updatedResp.body.title).toEqual('win');
  expect(updatedResp.body.price).toEqual(100);

});

it('publishes an event', async () => {
  const cookie = getCookie();
  const response = await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', cookie)
    .send({ title: 'addsdd', price: 44 });

  await request(app)
    .put(`/api/v1/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'win', price: 100 })
    .expect(200);
  
  expect(natsClientWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if ticket is reserved', async () => {
  const cookie = getCookie();
  const response = await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', cookie)
    .send({ title: 'addsdd', price: 44 });
  
  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/v1/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'win', price: 100 })
    .expect(400);
});
