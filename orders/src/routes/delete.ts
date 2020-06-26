import express, { Request, Response } from 'express';
import { requireAuth, NotFoundError, NotAuthorizedError } from '@saheedpass/common';
import { Order, OrderStatus } from '../db/models/order';

const router = express.Router();

router.delete('/api/v1/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  order.status = OrderStatus.Cancelled;
  await order.save();

  // publish an event

  res.status(204).send(order);
});

export { router as deleteOrderRouter };
