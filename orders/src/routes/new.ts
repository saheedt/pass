import express, { Request, Response } from 'express';
import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError } from '@saheedpass/common';
import { body } from 'express-validator';
import { Order } from '../db/models/order';
import { Ticket } from '../db/models/ticket';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsClientWrapper } from '../nats-client-wrapper';
// import mongoose from 'mongoose';

const router = express.Router();

router.post(
  '/api/v1/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      // .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket not found.');
    }

    const isReserved = await ticket.isReserved()
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved.');
    }

    const expiration = new Date();
    expiration.setSeconds(
      expiration.getSeconds() + Number(process.env.EXPIRATION_WINDOW_SECONDS)
    );
    
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket
    });
    await order.save();
    new OrderCreatedPublisher(natsClientWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price
      }
    })
    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
