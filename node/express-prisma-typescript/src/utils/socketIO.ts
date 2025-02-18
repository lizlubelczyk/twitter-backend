import { Server as httpServer } from 'http'
import { Server } from 'socket.io'
import { FollowerService, FollowerServiceImpl } from '@domains/follower/service'
import { FollowerRepositoryImpl } from '@domains/follower/repository'
import { ChatRepositoryImpl } from '@domains/chat/repository'
import { db } from '@utils/database'
import { ChatService, ChatServiceImpl } from '@domains/chat/service'
import { ConflictException } from '@utils/errors'

const followerService: FollowerService = new FollowerServiceImpl(new FollowerRepositoryImpl(db))
const chatService: ChatService = new ChatServiceImpl(new ChatRepositoryImpl(db))

export let io: Server

export const setupIO = (server: httpServer): void => {
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    connectionStateRecovery: {}
  })

  io.on('connection', (socket) => {
    console.log('a user connected')

    socket.on('join room', async (senderId: string, receiverId: string) => {
      console.log('join room', senderId, receiverId)
      await socket.join(senderId + '_' + receiverId)
    })
    socket.on('leave room', async (senderId: string, receiverId: string) => {
      await socket.leave(senderId + '_' + receiverId)
    })

    socket.on('chat message', async (msg: string, receiverId: string, senderId: string) => {
      console.log('message: ' + msg)
      if (await followerService.isFollowing(senderId, receiverId) && await followerService.isFollowing(receiverId, senderId)) {
        try {
          const message = await chatService.saveMessage(senderId, receiverId, msg)
          io.to(senderId + '_' + receiverId).emit('chat message', msg, message.createdAt)
        } catch (e) {
          throw new ConflictException()
        }
      }
    })

    socket.on('bring room', async (receiverId: string, senderId: string) => {
      const messages = await chatService.getMessages(senderId, receiverId)
      messages.map(msg => io.to(receiverId + '_' + senderId).emit('chat message', msg.content, msg.createdAt))
    })

    socket.on('disconnect', () => {
      console.log('user disconnected')
    })
  })
}
