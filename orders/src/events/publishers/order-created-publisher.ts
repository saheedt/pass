import { Publisher, OrderCreatedEvent, Subjects } from '@saheedpass/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
