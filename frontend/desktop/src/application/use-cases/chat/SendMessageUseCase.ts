// Use Case: Send Message
import type { MessageRepository } from '../../ports/driven/MessageRepository';
import type { WebSocketPort } from '../../ports/driven/WebSocketPort';
import type { ChatRoomRepository } from '../../ports/driven/ChatRoomRepository';
import { createMessage, type Message } from '../../../domain/entities/Message';
import { createMessageSentEvent } from '../../../domain/events';
import { validateMessageContent } from '../../../domain/services';

export class SendMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly webSocketPort: WebSocketPort,
    private readonly chatRoomRepository: ChatRoomRepository,
  ) {}

  async execute(params: {
    chatRoomId: string;
    senderId: string;
    content: string;
    type: 'text' | 'image' | 'file' | 'code';
  }): Promise<{ message: Message; events: ReturnType<typeof createMessageSentEvent>[] }> {
    // Validate
    const validation = validateMessageContent(params.content);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // Check chat room exists
    const chatRoom = await this.chatRoomRepository.findById(params.chatRoomId);
    if (!chatRoom) {
      throw new Error('Chat room not found');
    }
    
    // Create message
    const message = createMessage({
      id: crypto.randomUUID(),
      chatRoomId: params.chatRoomId,
      senderId: params.senderId,
      type: params.type,
      content: params.content,
      status: 'sending',
    });
    
    // Save to repository
    const savedMessage = await this.messageRepository.save(message);
    
    // Send via WebSocket
    this.webSocketPort.send({ type: 'message', payload: savedMessage });
    
    // Update status to sent
    await this.messageRepository.updateStatus(savedMessage.id, 'sent');
    
    const updatedMessage = { ...savedMessage, status: 'sent' as const };
    const event = createMessageSentEvent(updatedMessage);
    
    return { message: updatedMessage, events: [event] };
  }
}
