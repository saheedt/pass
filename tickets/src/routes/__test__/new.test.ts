import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../db/models/ticket';
import { getCookie } from '../../test/auth-helper';
import { natsClientWrapper } from '../../nats-client-wrapper';

it('has a route handler listening to /api/v1/tickets for post request', async () => {
  const response = await request(app)
    .post('/api/v1/tickets')
    .send({})
  
  expect(response.status).not.toEqual(404);
});

it('can only be accessed if user is signed in', async () => {
  const response = await request(app)
    .post('/api/v1/tickets')
    .send({});
  
  expect(response.status).toEqual(401);
});

it('returns a status other than 401 if user is signed in', async () => {
  const response = await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', getCookie())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', getCookie())
    .send({
      title: '',
      price: 10
    })
    .expect(400);
  
   await request(app)
     .post('/api/v1/tickets')
     .set('Cookie', getCookie())
     .send({
       price: 10
     })
     .expect(400);
});

it('returns an error if invalid priceis provided', async () => {
   await request(app)
     .post('/api/v1/tickets')
     .set('Cookie', getCookie())
     .send({
       title: 'jjddd',
       price: -10
     })
     .expect(400);
   await request(app)
     .post('/api/v1/tickets')
     .set('Cookie', getCookie())
     .send({
       title: 'ndadkn',
     })
     .expect(400);
});

it('creates a ticket with valid inputs', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title = 'ndadkn';

  await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', getCookie())
    .send({
      title,
      price: 20
    })
    .expect(201);
  
  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(20);
});

it('publishes an event', async () => {
  const title = 'ndadkn';
  await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', getCookie())
    .send({
      title,
      price: 20
    })
    .expect(201);
  
  expect(natsClientWrapper.client.publish).toHaveBeenCalled();
});