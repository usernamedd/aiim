// Use Case: Create Group
import type { ChatRoomRepository } from '../../ports/driven/ChatRoomRepository';
import { createChatRoom, type ChatRoom } from '../../../domain/entities/ChatRoom';
import { createChatRoomCreatedEvent } from '../../../domain/events';

export class CreateGroupUseCase {
  constructor(private readonly chatRoomRepository: ChatRoomRepository) {}

  async execute(params: {
    name: string;
    ownerId: string;
    memberIds: string[];
    avatar?: string;
  }): Promise<{ chatRoom: ChatRoom; events: ReturnType<typeof createChatRoomCreatedEvent>[] }> {
    const chatRoom = createChatRoom({
      id: crypto.randomUUID(),
      type: 'group',
      name: params.name,
      avatar: params.avatar,
      ownerId: params.ownerId,
      memberIds: params.memberIds,
    });
    
    const saved = await this.chatRoomRepository.save(chatRoom);
    const event = createChatRoomCreatedEvent(saved.id, params.ownerId);
    
    return { chatRoom: saved, events: [event] };
  }
}
