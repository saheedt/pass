import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from '@saheedpass/common';
import { stripe } from '../stripe';
import { Order } from '../db/model/Order';
import { Payment } from '../db/model/payment';
import { PaymentCreatedPublisher } from '../events/publisher/payment-created-publisher';
import { natsClientWrapper } from '../nats-client-wrapper';

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

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token
    });

    const payment = Payment.build({
      orderId,
      stripeId: charge.id
    });
    await payment.save();

    await new PaymentCreatedPublisher(natsClientWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
