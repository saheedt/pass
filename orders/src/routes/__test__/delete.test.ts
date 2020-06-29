import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../db/models/ticket';
import { Order, OrderStatus } from '../../db/models/order';
import { getCookie } from '../../test/auth-helper';
import { natsClientWrapper } from '../../nats-client-wrapper';

it('marks an order cancelled', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 20
  });
  await ticket.save();

  const cookie = getCookie();

  const { body: order } = await request(app)
    .post('/api/v1/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);
  
  await request(app)
    .delete(`/api/v1/orders/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(204);
  
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('returns unauthorized error if trying to cancel order belonging to another user', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 20
  });
  await ticket.save();

  const cookie = getCookie();

  const { body: order } = await request(app)
    .post('/api/v1/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/v1/orders/${order.id}`)
    .set('Cookie', getCookie())
    .send()
    .expect(401);
});

it('returns not found error if trying to cancel non-existing order', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 20
  });
  await ticket.save();

  const cookie = getCookie();

  const { body: order } = await request(app)
    .post('/api/v1/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);
  
  const nonExistingOrderId = mongoose.Types.ObjectId().toHexString();
  await request(app)
    .delete(`/api/v1/orders/${nonExistingOrderId}`)
    .set('Cookie', cookie)
    .send()
    .expect(404);
});

it('emits an order cancelled event', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 20
  });
  await ticket.save();

  const cookie = getCookie();

  const { body: order } = await request(app)
    .post('/api/v1/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/v1/orders/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(204);
  
  expect(natsClientWrapper.client.publish).toHaveBeenCalledTimes(2);
});
