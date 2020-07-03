import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@saheedpass/common';
import { natsClientWrapper } from '../../../nats-client-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { Order } from '../../../db/model/Order';

const setup = async () => {
  const listener = new OrderCreatedListener(natsClientWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'jnslnc',
    userId: 'kjsbjan',
    status: OrderStatus.Created,
    ticket: {
      id: 'apeijkd',
      price: 20
    }
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg };
}

it('replicates the new order info', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
