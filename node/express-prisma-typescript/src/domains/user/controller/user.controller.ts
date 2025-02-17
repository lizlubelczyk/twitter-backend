import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db } from '@utils'

import { UserRepositoryImpl } from '../repository'
import { UserService, UserServiceImpl } from '../service'
import { generateUploadUrl } from '@domains/user/utils/s3Service'

export const userRouter = Router()

// Use dependency injection
const service: UserService = new UserServiceImpl(new UserRepositoryImpl(db))

userRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, skip } = req.query as Record<string, string>

  const users = await service.getUserRecommendations(userId, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json(users)
})

userRouter.get('/me', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const user = await service.getUser(userId)

  return res.status(HttpStatus.OK).json(user)
})

userRouter.get('/getById/:userId', async (req: Request, res: Response) => {
  const { userId: otherUserId } = req.params

  const user = await service.getUser(otherUserId)

  return res.status(HttpStatus.OK).json(user)
})

userRouter.delete('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  await service.deleteUser(userId)

  return res.status(HttpStatus.OK)
})

userRouter.put('/privacy', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  console.log('userId', userId)
  const user = await service.switchPrivacy(userId)

  return res.status(HttpStatus.OK).json(user)
})

userRouter.get('/profile_picture', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  console.log('userId', userId)
  try {
    const { uploadUrl, fileUrl } = await generateUploadUrl(userId)
    await service.setProfilePicture(userId, fileUrl)
    return res.status(HttpStatus.OK).json({ uploadUrl })
  } catch (e) {
    const err = e as Error
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message })
  }
})
