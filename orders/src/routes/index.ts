import express, { Request, Response } from 'express';
import { requireAuth } from '@saheedpass/common';
import { Order } from '../db/models/order';

const router = express.Router();

router.get('/api/v1/orders', requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.currentUser!.id
  }).populate('ticket');
  
  res.status(200).send(orders);
});

export { router as indexOrderRouter };
