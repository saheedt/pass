import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedEvent } from '@saheedpass/common';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsClientWrapper } from '../../../nats-client-wrapper';
import { Ticket } from '../../../db/models/ticket';

const setup = async () => {
  const listener = new TicketUpdatedListener(natsClientWrapper.client);
  
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 50,
  });
  await ticket.save();

  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: ' new tester',
    price: 80,
    userId: 'knnjbjbjb'
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { msg, data, ticket, listener };
};

it('finds, updates, and saves a ticket', async () => {
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event version is out of sync', async () => {
  const { msg, data, ticket, listener } = await setup();

  data.version = 10;

  // we are using try/catch as making an async assertion
  // is impossible for now.
  try {
    await listener.onMessage(data, msg);
  } catch (error) { }
  
  expect(msg.ack).not.toHaveBeenCalled();

});
