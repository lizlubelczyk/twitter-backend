// src/domains/chat/service/chat.service.test.ts
import { ChatService } from './chat.service'
import { Message } from '@prisma/client'

// Mock repository
const mockRepository = {
  saveMessage: jest.fn(),
  getMessages: jest.fn(),
  deleteMessage: jest.fn()
}

// Create an instance of ChatService with the mocked repository
const chatService: ChatService = {
  saveMessage: mockRepository.saveMessage,
  getMessages: mockRepository.getMessages,
  deleteMessage: mockRepository.deleteMessage
}

describe('ChatService', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should save a message', async () => {
    const message: Message = { id: '1', senderId: 'sender1', receiverId: 'receiver1', content: 'Hello', createdAt: new Date(), updatedAt: new Date(), deletedAt: null }
    mockRepository.saveMessage.mockResolvedValue(message)

    const result = await chatService.saveMessage('sender1', 'receiver1', 'Hello')
    expect(result).toEqual(message)
    expect(mockRepository.saveMessage).toHaveBeenCalledWith('sender1', 'receiver1', 'Hello')
  })

  it('should get messages between two users', async () => {
    const messages: Message[] = [
      { id: '1', senderId: 'sender1', receiverId: 'receiver1', content: 'Hello', createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
      { id: '2', senderId: 'receiver1', receiverId: 'sender1', content: 'Hi', createdAt: new Date(), updatedAt: new Date(), deletedAt: null }
    ]
    mockRepository.getMessages.mockResolvedValue(messages)

    const result = await chatService.getMessages('sender1', 'receiver1')
    expect(result).toEqual(messages)
    expect(mockRepository.getMessages).toHaveBeenCalledWith('sender1', 'receiver1')
  })

  it('should delete a message', async () => {
    const message: Message = { id: '1', senderId: 'sender1', receiverId: 'receiver1', content: 'Hello', createdAt: new Date(), updatedAt: new Date(), deletedAt: null }
    mockRepository.deleteMessage.mockResolvedValue(message)

    const result = await chatService.deleteMessage('1')
    expect(result).toEqual(message)
    expect(mockRepository.deleteMessage).toHaveBeenCalledWith('1')
  })
})
