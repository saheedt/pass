import { Publisher, Subjects, TicketCreatedEvent } from '@saheedpass/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
