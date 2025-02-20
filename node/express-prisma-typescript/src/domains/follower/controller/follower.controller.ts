import { Request, Response, Router } from 'express'
import { FollowerServiceImpl } from '@domains/follower/service'
import { FollowerRepositoryImpl } from '@domains/follower/repository'
import { db } from '@utils'

export const followerRouter = Router()

const service = new FollowerServiceImpl(new FollowerRepositoryImpl(db))

/**
 * @swagger
 * tags:
 *   name: Followers
 *   description: Endpoints related to following and unfollowing users
 */

/**
 * @swagger
 * /follow/{followedId}:
 *   post:
 *     summary: Follow a user
 *     tags: [Followers]
 *     parameters:
 *       - in: path
 *         name: followedId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to follow
 *     responses:
 *       200:
 *         description: Successfully followed the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully followed user"
 *       400:
 *         description: Already following the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Already following"
 */
followerRouter.post('/follow/:followedId', async (req: Request, res: Response) => {
  const { followedId } = req.params
  const { userId } = res.locals.context
  const isFollowing = await service.isFollowing(userId, followedId)
  if (userId === followedId) {
    return res.status(400).json({ error: 'Cannot follow yourself' })
  }
  if (isFollowing) {
    return res.status(400).json({ error: 'Already following' })
  }
  await service.follow(userId, followedId)
  res.json({ message: 'Successfully followed user' })
})

/**
 * @swagger
 * /unfollow/{followedId}:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Followers]
 *     parameters:
 *       - in: path
 *         name: followedId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to unfollow
 *     responses:
 *       200:
 *         description: Successfully unfollowed the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unfollowed"
 *       400:
 *         description: Not following the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Not following"
 */
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

export default followerRouter
