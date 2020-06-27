import { Publisher, OrderCancelledEvent, Subjects } from '@saheedpass/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
