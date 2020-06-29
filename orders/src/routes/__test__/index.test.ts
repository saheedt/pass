import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../db/models/ticket';
import { getCookie } from '../../test/auth-helper';

const buildTicket = async (title: string, price: number) => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title,
    price
  });
  await ticket.save();

  return ticket;
};

it('fetches orders for a user', async () => {
  const ticketOne = await buildTicket('first', 20);
  const ticketTwo = await buildTicket('second', 30);
  const ticketThree = await buildTicket('third', 40);

  const userOne = getCookie();
  const userTwo = getCookie();

  await request(app)
    .post('/api/v1/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);
  
  const { body: orderOne } = await request(app)
    .post('/api/v1/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);
  
  const { body: orderTwo } = await request(app)
    .post('/api/v1/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);
  
  const response = await request(app)
    .get('/api/v1/orders')
    .set('Cookie', userTwo)
    .expect(200);
  
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
