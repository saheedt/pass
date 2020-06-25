import { Publisher, Subjects, TicketUpdatedEvent } from '@saheedpass/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
