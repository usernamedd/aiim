// Use Case: Create Chat Room
import type { ChatRoomRepository } from '../../ports/driven/ChatRoomRepository';
import { createChatRoom, type ChatRoom } from '../../../domain/entities';
import { createChatRoomCreatedEvent } from '../../../domain/events';

export class CreateChatRoomUseCase {
  constructor(private readonly chatRoomRepository: ChatRoomRepository) {}

  async execute(params: {
    type: 'private' | 'group';
    name: string;
    ownerId: string;
    memberIds: string[];
  }): Promise<{ chatRoom: ChatRoom; events: ReturnType<typeof createChatRoomCreatedEvent>[] }> {
    const chatRoom = createChatRoom({
      id: crypto.randomUUID(),
      type: params.type,
      name: params.name,
      ownerId: params.ownerId,
      memberIds: params.memberIds,
    });
    
    const saved = await this.chatRoomRepository.save(chatRoom);
    const event = createChatRoomCreatedEvent(saved.id, params.ownerId);
    
    return { chatRoom: saved, events: [event] };
  }
}
