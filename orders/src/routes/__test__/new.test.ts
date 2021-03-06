import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../db/models/ticket';
import { Order, OrderStatus } from '../../db/models/order';
import { getCookie } from '../../test/auth-helper';
import { natsClientWrapper } from '../../nats-client-wrapper';


it('returns an error if ticket does not exist', async () => {
  const ticketId = mongoose.Types.ObjectId();
  await request(app)
    .post('/api/v1/orders')
    .set('Cookie', getCookie())
    .send({ ticketId })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'test ticket',
    price: 20
  });
  await ticket.save();
  const order = Order.build({
    ticket,
    userId: 'landadnakn',
    status: OrderStatus.Created,
    expiresAt: new Date()
  });
  await order.save();

  await request(app)
    .post('/api/v1/orders')
    .set('Cookie', getCookie())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reserves a ticket', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'test ticket',
    price: 20
  });
  await ticket.save();

  const orderResp = await request(app)
    .post('/api/v1/orders')
    .set('Cookie', getCookie())
    .send({ ticketId: ticket.id })
    .expect(201);
  
  expect(orderResp.body.ticket.title).toEqual('test ticket');
  expect(orderResp.body.status).toEqual('created');
});

it('emits an order:created event', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'test ticket',
    price: 20
  });
  await ticket.save();

  await request(app)
    .post('/api/v1/orders')
    .set('Cookie', getCookie())
    .send({ ticketId: ticket.id })
    .expect(201);
  
  expect(natsClientWrapper.client.publish).toHaveBeenCalled();
});