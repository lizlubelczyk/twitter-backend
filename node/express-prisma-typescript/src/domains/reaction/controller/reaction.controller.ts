import { Router } from 'express'
import { ReactionService, ReactionServiceImpl } from '@domains/reaction/service'
import { ReactionRepositoryImpl } from '@domains/reaction/repository'
import { db } from '@utils'

export const reactionRouter = Router()

const service: ReactionService = new ReactionServiceImpl(new ReactionRepositoryImpl(db))

reactionRouter.post('/:type/:postId', async (req, res) => {
  const { userId } = res.locals.context
  const { postId } = req.params
  const { type } = req.params
  const hasReacted = await service.hasReacted(userId, postId, type)
  if (hasReacted) {
    return res.status(400).send('Already reacted')
  }
  await service.createReaction(userId, postId, type)
  res.sendStatus(200)
})

reactionRouter.delete('/:type/:postId', async (req, res) => {
  const { userId } = res.locals.context
  const { postId } = req.params
  const { type } = req.params
  const hasReacted = await service.hasReacted(userId, postId, type)
  if (!hasReacted) {
    return res.status(400).send('Not reacted')
  }
  await service.deleteReaction(userId, postId, type)
  res.sendStatus(200)
})
