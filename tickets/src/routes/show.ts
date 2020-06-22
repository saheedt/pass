import express, { Request, Response } from 'express';
import { NotFoundError} from '@saheedpass/common';
import { Ticket } from '../db/models/ticket';

const router = express.Router();

router.get('/api/v1/tickets/:id', async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }
  res.status(200).send(ticket);
});

export { router as showTicketRouter };
  
