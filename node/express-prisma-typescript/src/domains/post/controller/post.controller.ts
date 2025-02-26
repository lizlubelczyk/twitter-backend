import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget to import it in your new controllers
import 'express-async-errors'

import { db, BodyValidation } from '@utils'

import { PostRepositoryImpl } from '../repository'
import { PostService, PostServiceImpl } from '../service'
import { CreatePostInputDTO } from '../dto'
import { UserRepositoryImpl } from '@domains/user/repository'
import { FollowerRepositoryImpl } from '@domains/follower/repository'
import { FollowerService, FollowerServiceImpl } from '@domains/follower/service'
import { UserService, UserServiceImpl } from '@domains/user/service'
import { CommentRepositoryImpl } from '@domains/comment/repository'
import { ReactionRepositoryImpl } from '@domains/reaction/repository'
import { CommentServiceImpl, CommentService } from '@domains/comment/service'

export const postRouter = Router()

// Use dependency injection
const commentService: CommentService = new CommentServiceImpl(new CommentRepositoryImpl(db), new UserRepositoryImpl(db), new ReactionRepositoryImpl(db))
const service: PostService = new PostServiceImpl(new PostRepositoryImpl(db), new UserRepositoryImpl(db), new ReactionRepositoryImpl(db), commentService)
const followService: FollowerService = new FollowerServiceImpl(new FollowerRepositoryImpl(db))
const userService: UserService = new UserServiceImpl(new UserRepositoryImpl(db), new FollowerRepositoryImpl(db))

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Endpoints for managing posts
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get latest posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of posts to retrieve
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *         description: Cursor for pagination (before)
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *         description: Cursor for pagination (after)
 *     responses:
 *       200:
 *         description: List of latest posts
 */
postRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const limit = Number(req.query.limit) || 10
  const skip = Number(req.query.skip) || 0
  const posts = await service.getLatestPosts(userId, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json(posts)
})

postRouter.get('/following', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const limit = Number(req.query.limit) || 10
  const skip = Number(req.query.skip) || 0
  const posts = await service.getFollowingPosts(userId, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json(posts)
})

/**
 * @swagger
 * /posts/{postId}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to retrieve
 *     responses:
 *       200:
 *         description: Returns the post
 *       404:
 *         description: Not following the author
 */
postRouter.get('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  const post = await service.getPost(postId)
  const posterId = post.authorId
  const isFollowing = await followService.isFollowing(userId, posterId)
  const isPrivate = await userService.isPrivate(posterId)

  if (!(isFollowing) && isPrivate) {
    return res.status(HttpStatus.NOT_FOUND).send('You are not following the author')
  }

  return res.status(HttpStatus.OK).json(post)
})

/**
 * @swagger
 * /posts/by_user/{userId}:
 *   get:
 *     summary: Get posts by a specific user
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose posts to retrieve
 *     responses:
 *       200:
 *         description: List of posts
 *       404:
 *         description: Not following the user
 */
postRouter.get('/by_user/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { userId: authorId } = req.params
  const limit = Number(req.query.limit) || 10
  const skip = Number(req.query.skip) || 0
  const isFollowing = await followService.isFollowing(userId, authorId)
  const isPrivate = await userService.isPrivate(authorId)

  if (!(isFollowing) && isPrivate) {
    return res.status(HttpStatus.NOT_FOUND).send('You are not following this user')
  }

  const posts = await service.getPostsByAuthor(userId, authorId, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json(posts)
})

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostInputDTO'
 *     responses:
 *       201:
 *         description: Post created successfully
 */
postRouter.post('/', BodyValidation(CreatePostInputDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { parentId } = req.query
  const data = req.body
  const parentIdString = parentId as string
  const post = await service.createPost(userId, data, parentIdString)

  return res.status(HttpStatus.CREATED).json(post)
})

/**
 * @swagger
 * /posts/{postId}:
 *   delete:
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 */
postRouter.delete('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  await service.deletePost(userId, postId)

  return res.status(HttpStatus.OK).send(`Deleted post ${postId}`)
})

export default postRouter
