import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { TicketCreatedEvent } from '@saheedpass/common';
import { TicketCreatedListener } from '../ticket-created-listener';
import { natsClientWrapper } from '../../../nats-client-wrapper';
import { Ticket } from '../../../db/models/ticket';
const setup = async () => {
  const listener = new TicketCreatedListener(natsClientWrapper.client);

  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: 'tester',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString()
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };
  return { listener, data, msg };
};

it('creates and saves a ticket', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.id);
  
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled()
})