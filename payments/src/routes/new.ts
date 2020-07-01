import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from '@saheedpass/common';
import { Order } from '../db/model/Order';

const router = express.Router();

router.post('/api/v1/payments',
  requireAuth,
  [
    body('token')
      .not()
      .isEmpty()
      .withMessage('payment token should be supplied'),
    body('orderId')
      .not()
      .isEmpty()
      .withMessage('orderId should be supplied')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError('Cannot pay for non-existing order');
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for cancelled order');
    }

    res.send({ success: true });
  }
);

export { router as createChargeRouter };
