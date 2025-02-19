import { Message } from '@prisma/client'
import { ChatRepository } from '@domains/chat/repository'

export class ChatServiceImpl {
  constructor (private readonly chatRepository: ChatRepository) {}
  async saveMessage (senderId: string, receiverId: string, message: string): Promise<any> {
    return await this.chatRepository.saveMessage(senderId, receiverId, message)
  }

  async getMessages (userId: string, otherUserId: string): Promise<Message[]> {
    return await this.chatRepository.getMessages(userId, otherUserId)
  }

  async deleteMessage (messageId: string): Promise<Message> {
    return await this.chatRepository.deleteMessage(messageId)
  }
}
