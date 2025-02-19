import { Router } from 'express'
import { CommentRepositoryImpl } from '@domains/comment/repository'
import { db } from '@utils'
import { CommentServiceImpl } from '@domains/comment/service/comment.service.impl'
import { CommentService } from '@domains/comment/service/comment.service'

export const commentRouter = Router()

const service: CommentService = new CommentServiceImpl(new CommentRepositoryImpl(db))

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Endpoints related to comments on posts
 */

/**
 * @swagger
 * /comments/{postId}:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to comment on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is a great post!"
 *     responses:
 *       201:
 *         description: Comment successfully created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized (user not authenticated)
 */
commentRouter.post('/:postId', async (req, res) => {
  const { userId } = res.locals.context
  const { postId } = req.params
  const data = req.body
  await service.create(userId, postId, data)
  res.sendStatus(201)
})

/**
 * @swagger
 * /comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to delete
 *     responses:
 *       204:
 *         description: Comment successfully deleted
 *       401:
 *         description: Unauthorized (user not authenticated)
 *       404:
 *         description: Comment not found
 */
commentRouter.delete('/:commentId', async (req, res) => {
  const { commentId } = req.params
  await service.delete(commentId)
  res.sendStatus(204)
})

/**
 * @swagger
 * /comments/{postId}:
 *   get:
 *     summary: Get comments for a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to retrieve comments for
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of comments to retrieve
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *         description: Cursor for pagination (fetch comments after this ID)
 *     responses:
 *       200:
 *         description: List of comments for the post
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "comment_12345"
 *                   userId:
 *                     type: string
 *                     example: "user_1"
 *                   postId:
 *                     type: string
 *                     example: "post_987"
 *                   content:
 *                     type: string
 *                     example: "I love this post!"
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-02-18T12:34:56.789Z"
 *       400:
 *         description: Invalid request parameters
 */
commentRouter.get('/:postId', async (req, res) => {
  const { postId } = req.params
  const { limit, after } = req.query
  const limitNumber = limit ? Number(limit) : undefined
  const afterString = after ? after.toString() : undefined
  const comments = await service.getByPostId(postId, limitNumber, afterString)
  res.status(200).json(comments)
})

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get comments made by the authenticated user
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of comments to retrieve
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *         description: Cursor for pagination (fetch comments after this ID)
 *     responses:
 *       200:
 *         description: List of comments made by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "comment_12345"
 *                   postId:
 *                     type: string
 *                     example: "post_987"
 *                   content:
 *                     type: string
 *                     example: "Interesting thoughts!"
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-02-18T12:34:56.789Z"
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized (user not authenticated)
 */
commentRouter.get('', async (req, res) => {
  const { userId } = res.locals.context
  const { limit, after } = req.query
  const limitNumber = limit ? Number(limit) : undefined
  const afterString = after ? after.toString() : undefined
  const comments = await service.getByUserId(userId, limitNumber, afterString)
  res.status(200).json(comments)
})

export default commentRouter
