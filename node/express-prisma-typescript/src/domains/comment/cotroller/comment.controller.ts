import { Router } from 'express'
import { CommentRepositoryImpl } from '@domains/comment/repository'
import { db } from '@utils'
import { CommentServiceImpl } from '@domains/comment/service/comment.service.impl'
import { CommentService } from '@domains/comment/service/comment.service'

export const commentRouter = Router()

const service: CommentService = new CommentServiceImpl(new CommentRepositoryImpl(db))

commentRouter.post('/:postId', async (req, res) => {
  const { userId } = res.locals.context
  const { postId } = req.params
  const data = req.body
  await service.create(userId, postId, data)
  res.sendStatus(201)
})

commentRouter.delete('/:commentId', async (req, res) => {
  const { commentId } = req.params
  await service.delete(commentId)
  res.sendStatus(204)
})

commentRouter.get('/:postId', async (req, res) => {
  const { postId } = req.params
  const { limit, after } = req.query
  const limitNumber = limit ? Number(limit) : undefined
  const afterString = after ? after.toString() : undefined
  const comments = await service.getByPostId(postId, limitNumber, afterString)
  res.status(200).json(comments)
})

commentRouter.get('', async (req, res) => {
  const { userId } = res.locals.context
  const { limit, after } = req.query
  const limitNumber = limit ? Number(limit) : undefined
  const afterString = after ? after.toString() : undefined
  const comments = await service.getByUserId(userId, limitNumber, afterString)
  res.status(200).json(comments)
})
