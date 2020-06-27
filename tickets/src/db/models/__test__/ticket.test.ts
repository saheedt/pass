import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async (done) => {
  const ticket = Ticket.build({
    title: 'mov',
    price: 12,
    userId: 'khabbfaj'
  })

  await ticket.save();

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  firstInstance!.set({ price: 15 });
  secondInstance!.set({ price: 20 });
  
  await firstInstance!.save();

  // because of jest issues with typescript when using
  // async function in a expect like so:
  // expect(async ()=> ).toThrow(), we will be using a
  // A TRY/CATCH trick to test this.
  try {
    await secondInstance!.save();
  } catch (err) {
    return done();
  }

  throw new Error('Should not reach this point');
});

it('increments version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'mov',
    price: 12,
    userId: 'khabbfaj'
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
})