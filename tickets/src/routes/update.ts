import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, NotFoundError, requireAuth, NotAuthorizedError, BadRequestError } from '@saheedpass/common';
import { Ticket } from '../db/models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-update-publisher';
import { natsClientWrapper } from '../nats-client-wrapper';

const router = express.Router();

router.put('/api/v1/tickets/:id',
  [
    body('title')
      .not()
      .isEmpty()
      .withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be present and greater than zero')
  ],
  validateRequest,
  requireAuth,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }

    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reserved ticket');
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
      
    ticket.set({
      title: req.body.title,
      price: req.body.price
    });
    await ticket.save();
    await new TicketUpdatedPublisher(natsClientWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
