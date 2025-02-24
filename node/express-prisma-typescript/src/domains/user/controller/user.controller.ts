import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db } from '@utils'

import { UserRepositoryImpl } from '../repository'
import { UserService, UserServiceImpl } from '../service'
import { generateUploadUrl } from '@utils/s3Service'
import { FollowerRepositoryImpl } from '@domains/follower/repository'
import { FollowerService, FollowerServiceImpl } from '@domains/follower/service'

export const userRouter = Router()

// Use dependency injection
const service: UserService = new UserServiceImpl(new UserRepositoryImpl(db), new FollowerRepositoryImpl(db))
const followerService: FollowerService = new FollowerServiceImpl(new FollowerRepositoryImpl(db))

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints for managing user-related operations
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get user recommendations
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of users to retrieve
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of users to skip for pagination
 *     responses:
 *       200:
 *         description: List of user recommendations
 */
userRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, skip } = req.query as Record<string, string>

  const users = await service.getUserRecommendations(userId, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json(users)
})

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Returns user details
 */
userRouter.get('/me', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const user = await service.getUser(userId)

  return res.status(HttpStatus.OK).json(user)
})

/**
 * @swagger
 * /users/profile_picture:
 *   get:
 *     summary: Generate a profile picture upload URL
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Upload URL generated
 *       500:
 *         description: Internal server error
 */
userRouter.get('/profile-picture', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  try {
    const { uploadUrl, fileUrl } = await generateUploadUrl(userId)
    await service.setProfilePicture(userId, fileUrl)
    return res.status(HttpStatus.OK).json({ uploadUrl })
  } catch (e) {
    const err = e as Error
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message })
  }
})

/**
 * @swagger
 * /users/byUserId/{userId}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to retrieve
 *     responses:
 *       200:
 *         description: Returns the user details
 *       404:
 *         description: User not found
 */
userRouter.get('/byUserId/:userId', async (req: Request, res: Response) => {
  const { userId: requesterId } = res.locals.context
  const { userId: targetUserId } = req.params

  try {
    const user = await service.getUser(targetUserId)
    const isFollowing = await followerService.isFollowing(requesterId, targetUserId)

    return res.status(HttpStatus.OK).json({ user, isFollowing })
  } catch (error) {
    return res.status(HttpStatus.NOT_FOUND).json({ message: 'User not found' })
  }
})

/**
 * @swagger
 * /users:
 *   delete:
 *     summary: Delete the current authenticated user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
userRouter.delete('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  await service.deleteUser(userId)

  return res.status(HttpStatus.OK).send('User deleted successfully')
})

/**
 * @swagger
 * /users/privacy:
 *   put:
 *     summary: Toggle user privacy setting
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Privacy setting updated
 */
userRouter.put('/privacy', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  console.log('userId', userId)
  const user = await service.switchPrivacy(userId)

  return res.status(HttpStatus.OK).json(user)
})

/**
 * @swagger
 * /users/by_username/{username}:
 *   get:
 *     summary: Search users by username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username to search for
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of users to retrieve
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of users to skip for pagination
 *     responses:
 *       200:
 *         description: List of users matching the username
 */
userRouter.get('/by_username/:username', async (req: Request, res: Response) => {
  const { username } = req.params
  const { limit, skip } = req.query as Record<string, string>

  const users = await service.getUsersByUsername(username, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json(users)
})

/**
 * @swagger
 * /users/profile/{userId}:
 *   get:
 *     summary: Get a user's profile by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to retrieve
 *     responses:
 *       200:
 *         description: Returns the user's profile details
 *       404:
 *         description: User not found
 */

userRouter.get('/profile/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params
  const user = await service.getProfile(userId)
  return res.status(HttpStatus.OK).json(user)
})

export default userRouter
