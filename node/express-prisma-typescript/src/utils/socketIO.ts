import { Server as httpServer } from 'http'
import { Server } from 'socket.io'
import { FollowerService, FollowerServiceImpl } from '@domains/follower/service'
import { FollowerRepositoryImpl } from '@domains/follower/repository'
import { ChatRepositoryImpl } from '@domains/chat/repository'
import { db } from '@utils/database'
import { ChatService, ChatServiceImpl } from '@domains/chat/service'
import { ConflictException } from '@utils/errors'
import { authenticateSocket } from '@utils/auth'

const followerService: FollowerService = new FollowerServiceImpl(new FollowerRepositoryImpl(db))
const chatService: ChatService = new ChatServiceImpl(new ChatRepositoryImpl(db))

export let io: Server

export const setupIO = (server: httpServer): void => {
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    connectionStateRecovery: {}
  })

  io.use(authenticateSocket)

  io.on('connection', (socket) => {
    const userId = socket.data.user
    console.log('a user connected:', userId)

    socket.on('join room', async ({ receiverId }: { receiverId: string }) => {
      console.log('join room', userId, receiverId)
      if (!userId || !receiverId) {
        console.error('Missing sender or receiver ID')
        return
      }

      const room = [userId, receiverId].sort().join('_')
      await socket.join(room)

      if (socket.rooms.has(room)) {
        console.log(`User ${userId} successfully joined room ${room}`)
      } else {
        console.error(`User ${userId} failed to join room ${room}`)
      }
    })

    socket.on('leave room', async (receiverId: string) => {
      const room = [userId, receiverId].sort().join('_')
      await socket.leave(room)
    })

    socket.on('chat message', async ({ msg, receiverId }: { msg: string, receiverId: string }) => {
      console.log('senderId:', userId, 'receiverId:', receiverId)
      console.log('message:', msg)

      if (!userId || !receiverId || !msg) {
        console.error('Missing senderId, receiverId, or message')
        return
      }

      const room = [userId, receiverId].sort().join('_')
      const roomData = io.sockets.adapter.rooms.get(room)

      if (!roomData?.has(socket.id)) {
        console.error(`User ${userId} is not in room ${room}, message rejected.`)
        return
      }

      if (await followerService.isFollowing(userId, receiverId) && await followerService.isFollowing(receiverId, userId)) {
        try {
          const message = await chatService.saveMessage(userId, receiverId, msg)
          io.to(room).emit('chat message', msg, message.createdAt)
        } catch (e) {
          console.error('Error saving message:', e)
          throw new ConflictException()
        }
      } else {
        console.error(`User ${userId} and ${receiverId} are not following each other.`)
      }
    })

    socket.on('bring room', async ({ receiverId }: { receiverId: string }) => {
      console.log('bring room', userId, receiverId)
      const room = [userId, receiverId].sort().join('_')
      const messages = await chatService.getMessages(userId, receiverId)
      messages.map(msg => io.to(room).emit('chat message', msg.content, msg.createdAt))
      console.log(messages)
    })

    socket.on('disconnect', () => {
      console.log('user disconnected')
    })
  })
}
