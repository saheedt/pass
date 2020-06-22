import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError
} from '@saheedpass/common';
import { Ticket } from '../db/models/ticket';

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

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
      
    ticket.set({
      title: req.body.title,
      price: req.body.price
    });
    await ticket.save();

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
