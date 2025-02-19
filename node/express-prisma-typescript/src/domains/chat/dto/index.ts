import { Message } from '@prisma/client'

export class MessageDTO {
  constructor (message: Message) {
    this.senderId = message.senderId
    this.content = message.content
  }

  senderId: string
  content: string
}
