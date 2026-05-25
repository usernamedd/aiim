// Use Case: Load Messages
import type { MessageRepository } from '../../ports/driven/MessageRepository';
import type { Message } from '../../../domain/entities';


export class LoadMessagesUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async execute(params: {
    chatRoomId: string;
    page: number;
    pageSize: number;
  }): Promise<{ messages: Message[]; total: number; hasMore: boolean }> {
    const messages = await this.messageRepository.findByChatRoom(
      params.chatRoomId,
      params.page,
      params.pageSize,
    );
    
    const total = await this.messageRepository.count(params.chatRoomId);
    const hasMore = params.page * params.pageSize < total;
    
    // Sort by createdAt descending (newest first)
    const sorted = [...messages].sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
    
    return {
      messages: sorted,
      total,
      hasMore,
    };
  }
}
