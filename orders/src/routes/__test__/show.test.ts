import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../db/models/ticket';
import { Order, OrderStatus } from '../../db/models/order';
import { getCookie } from '../../test/auth-helper';

it('fetches an order', async () => {
  const ticket = Ticket.build({ title: 'test', price: 20 });
  await ticket.save();

  const cookie = getCookie();

  const { body: order } = await request(app)
    .post('/api/v1/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);
  
  const {body: fetchedOrder } = await request(app)
    .get(`/api/v1/orders/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(200);
  
  expect(fetchedOrder.id).toEqual(order.id);
});

it('returns error if order belongs to another user', async () => {
  const ticket = Ticket.build({ title: 'test', price: 20 });
  await ticket.save();

  const cookie = getCookie();

  const { body: order } = await request(app)
    .post('/api/v1/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .get(`/api/v1/orders/${order.id}`)
    .set('Cookie', getCookie())
    .send()
    .expect(401);
});

it('returns error if order is not found', async () => {
  const ticket = Ticket.build({ title: 'test', price: 20 });
  await ticket.save();

  const cookie = getCookie();

  await request(app)
    .post('/api/v1/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);
  
  const nonExistingOrderId = mongoose.Types.ObjectId().toHexString();
  await request(app)
    .get(`/api/v1/orders/${nonExistingOrderId}`)
    .set('Cookie', cookie)
    .send()
    .expect(404);
});
