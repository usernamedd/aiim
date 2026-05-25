// Use Case: Mark Message as Read
import type { MessageRepository } from '../../ports/driven/MessageRepository';
import { createMessageReadEvent } from '../../../domain/events';
import type { MessageId, UserId, ChatRoomId } from '../../../domain/entities';

export class MarkMessageReadUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async execute(params: {
    messageId: string;
    userId: string;
    chatRoomId: string;
  }): Promise<{ events: ReturnType<typeof createMessageReadEvent>[] }> {
    await this.messageRepository.updateStatus(params.messageId, 'read');
    const event = createMessageReadEvent(params.messageId as MessageId, params.userId as UserId, params.chatRoomId as ChatRoomId);
    return { events: [event] };
  }
}
