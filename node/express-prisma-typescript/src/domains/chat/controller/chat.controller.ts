import { ChatService, ChatServiceImpl } from '@domains/chat/service'
import { ChatRepositoryImpl } from '@domains/chat/repository'
import { db } from '@utils'
import HttpStatus from 'http-status'
import { Request, Response, Router } from 'express'

export const chatRouter = Router()

const chatService: ChatService = new ChatServiceImpl(new ChatRepositoryImpl(db))

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat messaging endpoints
 */

/**
 * @swagger
 * /chat/{userId}:
 *   get:
 *     summary: Retrieve chat messages between authenticated user and another user
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve messages with
 *     responses:
 *       200:
 *         description: List of messages exchanged between the two users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "msg_12345"
 *                   senderId:
 *                     type: string
 *                     example: "user_1"
 *                   receiverId:
 *                     type: string
 *                     example: "user_2"
 *                   content:
 *                     type: string
 *                     example: "Hello, how are you?"
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-02-18T12:34:56.789Z"
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized (user not authenticated)
 */
chatRouter.get('/:userId', async (req: Request, res: Response) => {
  const { userId: senderId } = res.locals.context
  const { userId: receiverId } = req.params
  const messages = await chatService.getMessages(senderId, receiverId)
  return res.status(HttpStatus.OK).json(messages)
})

/**
 * @swagger
 * /chat/{messageId}:
 *   delete:
 *     summary: Delete a specific chat message
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the message to delete
 *     responses:
 *       204:
 *         description: Message successfully deleted
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized (user not authenticated)
 *       404:
 *         description: Message not found
 */
chatRouter.delete('/:messageId', async (req: Request, res: Response) => {
  const { messageId } = req.params
  const isSender = await chatService.isSender(res.locals.context.userId, messageId)
  if (!isSender) {
    return res.sendStatus(HttpStatus.UNAUTHORIZED)
  }
  await chatService.deleteMessage(messageId)
  return res.sendStatus(HttpStatus.NO_CONTENT)
})

export default chatRouter
