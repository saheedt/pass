import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent, OrderStatus } from '@saheedpass/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsClientWrapper } from '../../../nats-client-wrapper';
import { Ticket } from '../../../db/models/ticket';


const setup = async () => {
  const listener = new OrderCancelledListener(natsClientWrapper.client);

  const orderId = mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'test',
    price: 30,
    userId: 'dnsna',
  });
  ticket.set({ orderId });
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id
    }
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, orderId, ticket, data, msg };
}

it('updates ticket, publishes an event and acks the message', async () => {
  const { msg, data, ticket, orderId, listener } = await setup();

  await listener.onMessage(data, msg);

  const updateTicket = await Ticket.findById(ticket.id);

  expect(updateTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsClientWrapper.client.publish).toHaveBeenCalled();
});
