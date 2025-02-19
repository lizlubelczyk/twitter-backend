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
    console.log('a user connected')

    socket.on('join room', async ({ receiverId }: { receiverId: string }) => {
      const senderId = socket.data.user // Extract senderId from authentication
      console.log('join room', senderId, receiverId)
      if (!senderId || !receiverId) {
        console.error('Missing sender or receiver ID')
        return
      }

      const room = [senderId, receiverId].sort().join('_')
      await socket.join(room)

      if (socket.rooms.has(room)) {
        console.log(`User ${senderId} successfully joined room ${room}`)
      } else {
        console.error(`User ${senderId} failed to join room ${room}`)
      }
    })

    socket.on('leave room', async (receiverId: string) => {
      const senderId = socket.data.user
      const room = [senderId, receiverId].sort().join('_')
      await socket.leave(room)
    })

    socket.on('chat message', async ({ msg, receiverId }: { msg: string, receiverId: string }) => {
      const senderId = socket.data.user // Extract senderId from authentication
      console.log('senderId:', senderId, 'receiverId:', receiverId)
      console.log('message:', msg)

      if (!senderId || !receiverId || !msg) {
        console.error('Missing senderId, receiverId, or message')
        return
      }

      const room = [senderId, receiverId].sort().join('_')
      const roomData = io.sockets.adapter.rooms.get(room)

      if (!roomData?.has(socket.id)) {
        console.error(`User ${senderId} is not in room ${room}, message rejected.`)
        return
      }

      if (await followerService.isFollowing(senderId, receiverId) && await followerService.isFollowing(receiverId, senderId)) {
        try {
          const message = await chatService.saveMessage(senderId, receiverId, msg)
          io.to(room).emit('chat message', msg, message.createdAt)
        } catch (e) {
          console.error('Error saving message:', e)
          throw new ConflictException()
        }
      } else {
        console.error(`User ${senderId} and ${receiverId} are not following each other.`)
      }
    })

    socket.on('bring room', async ({ senderId, receiverId }: { senderId: string, receiverId: string }) => {
      console.log('bring room', senderId, receiverId)
      const room = [senderId, receiverId].sort().join('_')
      const messages = await chatService.getMessages(senderId, receiverId)
      messages.map(msg => io.to(room).emit('chat message', msg.content, msg.createdAt))
      console.log(messages)
    })

    socket.on('disconnect', () => {
      console.log('user disconnected')
    })
  })
}
