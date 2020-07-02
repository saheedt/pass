import { Publisher, PaymentCreatedEvent, Subjects } from '@saheedpass/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
