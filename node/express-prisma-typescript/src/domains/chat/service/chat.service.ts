import { Message } from '@prisma/client'

export interface ChatService {
  saveMessage: (senderId: string, receiverId: string, message: string) => Promise<Message>
  getMessages: (senderId: string, receiverId: string) => Promise<Message[]>
  deleteMessage: (messageId: string) => Promise<Message>
  isSender: (userId: string, messageId: string) => Promise<boolean>
}
