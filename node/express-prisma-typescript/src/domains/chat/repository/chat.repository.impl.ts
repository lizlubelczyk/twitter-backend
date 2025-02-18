import { ChatRepository } from '@domains/chat/repository/chat.repository'
import { Message, PrismaClient } from '@prisma/client'

export class ChatRepositoryImpl implements ChatRepository {
  constructor (private readonly db: PrismaClient) {}

  async saveMessage (senderId: string, receiverId: string, content: string): Promise<Message> {
    return await this.db.message.create({
      data: {
        senderId,
        receiverId,
        content
      }
    })
  }

  async getMessages (senderId: string, receiverId: string): Promise<Message[]> {
    return await this.db.message.findMany({
      where: {
        OR: [
          {
            senderId,
            receiverId
          },
          {
            senderId: receiverId,
            receiverId: senderId
          }
        ]
      }
    })
  }

  async deleteMessage (messageId: string): Promise<Message> {
    return await this.db.message.delete({
      where: {
        id: messageId
      }
    })
  }
}
