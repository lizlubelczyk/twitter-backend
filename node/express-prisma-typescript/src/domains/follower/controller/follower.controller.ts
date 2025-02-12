import { Request, Response, Router } from 'express'
import { FollowerServiceImpl } from '@domains/follower/service'
import { FollowerRepositoryImpl } from '@domains/follower/repository'
import { db } from '@utils'

export const followerRouter = Router()

const service = new FollowerServiceImpl(new FollowerRepositoryImpl(db))

followerRouter.post('/follow/:followedId', async (req: Request, res: Response) => {
  const { followedId } = req.params
  const { userId } = res.locals.context
  const isFollowing = await service.isFollowing(userId, followedId)
  if (isFollowing) {
    return res.status(400).json({ error: 'Already following' })
  }
  const follow = await service.follow(userId, followedId)
  res.json(follow)
})

followerRouter.delete('/unfollow/:followedId', async (req: Request, res: Response) => {
  const { followedId } = req.params
  const { userId } = res.locals.context
  const isFollowing = await service.isFollowing(userId, followedId)
  if (!isFollowing) {
    return res.status(400).json({ error: 'Not following' })
  }
  await service.unfollow(userId, followedId)
  res.json({ message: 'Unfollowed' })
})
