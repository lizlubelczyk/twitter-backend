import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
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

export const postRouter = Router()

// Use dependency injection
const service: PostService = new PostServiceImpl(new PostRepositoryImpl(db), new UserRepositoryImpl(db), new ReactionRepositoryImpl(db), new CommentRepositoryImpl(db))
const followService: FollowerService = new FollowerServiceImpl(new FollowerRepositoryImpl(db))
const userService: UserService = new UserServiceImpl(new UserRepositoryImpl(db))

postRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, before, after } = req.query as Record<string, string>

  const posts = await service.getLatestPosts(userId, { limit: Number(limit), before, after })

  return res.status(HttpStatus.OK).json(posts)
})

postRouter.get('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  const post = await service.getPost(userId, postId)
  const posterId = post.authorId
  const isFollowing = await followService.isFollowing(userId, posterId)
  const isPrivate = await userService.isPrivate(posterId)

  if (!(isFollowing) && isPrivate) {
    return res.status(HttpStatus.NOT_FOUND).send('You are not following the author')
  }

  return res.status(HttpStatus.OK).json(post)
})

postRouter.get('/by_user/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { userId: authorId } = req.params
  const isFollowing = await followService.isFollowing(userId, authorId)
  const isPrivate = await userService.isPrivate(authorId)

  if (!(isFollowing) && isPrivate) {
    return res.status(HttpStatus.NOT_FOUND).send('You are not following this user')
  }

  const posts = await service.getPostsByAuthor(userId, authorId)

  return res.status(HttpStatus.OK).json(posts)
})

postRouter.post('/', BodyValidation(CreatePostInputDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  console.log('userId', userId)
  const data = req.body

  const post = await service.createPost(userId, data)

  return res.status(HttpStatus.CREATED).json(post)
})

postRouter.delete('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  await service.deletePost(userId, postId)

  return res.status(HttpStatus.OK).send(`Deleted post ${postId}`)
})
