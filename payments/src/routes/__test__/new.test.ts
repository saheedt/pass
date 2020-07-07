import mongoose from 'mongoose';
import request from 'supertest';
import { OrderStatus } from '@saheedpass/common';
import { app } from '../../app';
import { getCookie } from '../../test/auth-helper';
import { Order } from '../../db/model/Order';
import { stripe } from '../../stripe';
import { Payment } from '../../db/model/payment';
import { fakeChargeId } from '../../__mocks__/stripe';

it('returns 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/v1/payments')
    .set('Cookie', getCookie())
    .send({
      token: 'snSNNADNA',
      orderId: mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);
});

it('returns a 401 when try to purching order that belongs to another user', async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 10,
    status: OrderStatus.Created
  });
  await order.save();

  await request(app)
    .post('/api/v1/payments')
    .set('Cookie', getCookie())
    .send({
      token: 'snSNNADNA',
      orderId: order.id
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 30,
    status: OrderStatus.Cancelled
  });
  await order.save();

  await request(app)
    .post('/api/v1/payments')
    .set('Cookie', getCookie(userId))
    .send({
      token: 'snSNNADNA',
      orderId: order.id
    })
    .expect(400);
});

it('returns a 201 with valid inputs', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 30,
    status: OrderStatus.Created
  });
  await order.save();

  await request(app)
    .post('/api/v1/payments')
    .set('Cookie', getCookie(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201);

  const chargeOptns = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptns.source).toEqual('tok_visa');
  expect(chargeOptns.amount).toEqual(30 * 100);
  expect(chargeOptns.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: fakeChargeId
  });

  expect(payment).not.toBeNull();
});
