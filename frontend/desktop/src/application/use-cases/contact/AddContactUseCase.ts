// Use Case: Add Contact
import { createContact, type Contact } from '../../../domain/entities/Contact';
import { createContactAddedEvent } from '../../../domain/events';

export class AddContactUseCase {
  constructor() {}

  async execute(params: {
    userId: string;
    contactUserId: string;
    remark?: string;
  }): Promise<{ contact: Contact; events: ReturnType<typeof createContactAddedEvent>[] }> {
    const contact = createContact({
      userId: params.userId,
      friendId: params.contactUserId,
      remark: params.remark,
    });
    
    const event = createContactAddedEvent(params.userId, params.contactUserId);
    
    return { contact, events: [event] };
  }
}
