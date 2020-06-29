import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@saheedpass/common';
import { OrderCreatedListener } from '../order-created-listener';
import { natsClientWrapper } from '../../../nats-client-wrapper';
import { Ticket } from '../../../db/models/ticket';

const setup = async () => {
  const listener = new OrderCreatedListener(natsClientWrapper.client);

  const ticket = Ticket.build({
    title: 'test T',
    price: 30,
    userId: 'jddsssjcsj'
  });

  await ticket.save();

  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'jddsssjcsj',
    expiresAt: 'jsjsjs',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    }
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, ticket, data, msg };
};

it('sets userId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async()=> {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsClientWrapper.client.publish).toHaveBeenCalled();
  
  const ticketUpdatedData = JSON.parse((natsClientWrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});