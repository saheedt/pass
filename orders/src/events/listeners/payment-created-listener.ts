import { Message } from 'node-nats-streaming';
import { Subjects, Listener, PaymentCreatedEvent, OrderStatus } from '@saheedpass/common';
import { queueGroupName } from './queue-group/queue-group-name';
import { Order } from '../../db/models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set('status', OrderStatus.Complete);
    await order.save();

    // Ideally we are supposed to emit an event to notify
    // any service interested in order service and it's state,
    // but since this is basically the final state on an order,
    // it feels right to just leave things as is.

    msg.ack();
  }
}
