import express, { Request, Response } from 'express';
import { Ticket } from '../db/models/ticket';

const router = express.Router();

router.get('/api/v1/tickets', async (req: Request, res: Response) => {
  const tickets = await Ticket.find({
    orderId: undefined
  });

  res.status(200).send(tickets);
});

export { router as indexTicketRouter };
