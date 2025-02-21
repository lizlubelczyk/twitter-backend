import { Router } from 'express'
import { ReactionService, ReactionServiceImpl } from '@domains/reaction/service'
import { ReactionRepositoryImpl } from '@domains/reaction/repository'
import { db } from '@utils'
import { PostRepositoryImpl } from '@domains/post/repository'

export const reactionRouter = Router()

const service: ReactionService = new ReactionServiceImpl(new ReactionRepositoryImpl(db), new PostRepositoryImpl(db))

/**
 * @swagger
 * /reactions/{type}/{postId}:
 *   post:
 *     summary: React to a post
 *     description: Adds a reaction (like, love, etc.) to a post.
 *     tags:
 *       - Reactions
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of reaction (e.g., like, love, laugh)
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to react to
 *     responses:
 *       200:
 *         description: Reaction added successfully
 *       400:
 *         description: User has already reacted
 *       401:
 *         description: Unauthorized
 */
reactionRouter.post('/:type/:postId', async (req, res) => {
  const { userId } = res.locals.context
  const { postId, type } = req.params
  const hasReacted = await service.hasReacted(userId, postId, type)
  if (hasReacted) {
    return res.status(400).send('Already reacted')
  }
  await service.createReaction(userId, postId, type)
  res.sendStatus(200)
})

/**
 * @swagger
 * /reactions/{type}/{postId}:
 *   delete:
 *     summary: Remove a reaction from a post
 *     description: Deletes a reaction from a post if it exists.
 *     tags:
 *       - Reactions
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of reaction (e.g., like, love, laugh)
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to remove the reaction from
 *     responses:
 *       200:
 *         description: Reaction removed successfully
 *       400:
 *         description: User has not reacted
 *       401:
 *         description: Unauthorized
 */
reactionRouter.delete('/:type/:postId', async (req, res) => {
  const { userId } = res.locals.context
  const { postId, type } = req.params
  const hasReacted = await service.hasReacted(userId, postId, type)
  if (!hasReacted) {
    return res.status(400).send('Not reacted')
  }
  await service.deleteReaction(userId, postId, type)
  res.sendStatus(200)
})

/**
 * @swagger
 * /reactions/{type}:
 *   get:
 *     summary: Get posts reacted to by user
 *     description: Retrieves a list of posts that the user has reacted to with a specific reaction type.
 *     tags:
 *       - Reactions
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of reaction (e.g., like, love, laugh)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results to return
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *         description: Cursor for pagination (ID of the last fetched post)
 *     responses:
 *       200:
 *         description: List of posts the user reacted to
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   postId:
 *                     type: string
 *                   reactionType:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
reactionRouter.get('/:type', async (req, res) => {
  const { userId } = res.locals.context
  const { type } = req.params
  const { limit, after } = req.query
  const posts = await service.getByUserIdAndType(userId, type, limit ? Number(limit) : undefined, after ? after.toString() : undefined)
  res.json(posts)
})
