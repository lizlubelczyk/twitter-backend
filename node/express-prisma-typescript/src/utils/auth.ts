import jwt, { JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import { Constants } from './constants'
import { UnauthorizedException } from './errors'
import { Socket } from 'socket.io'

export const generateAccessToken = (payload: Record<string, string | boolean | number>): string => {
  // Do not use this in production, the token will last 24 hours
  // For production apps, use a 15-minute token with a refresh token stored in a HttpOnly Cookie
  return jwt.sign(payload, Constants.TOKEN_SECRET, { expiresIn: '24h' })
}

export const withAuth = (req: Request, res: Response, next: () => any): void => {
  // Get the token from the authorization header
  const [bearer, token] = (req.headers.authorization)?.split(' ') ?? []
  // Verify that the Authorization header has the expected shape
  if (!bearer || !token || bearer !== 'Bearer') throw new UnauthorizedException('MISSING_TOKEN')

  // Verify that the token is valid
  jwt.verify(token, Constants.TOKEN_SECRET, (err, context) => {
    if (err) throw new UnauthorizedException('INVALID_TOKEN')
    res.locals.context = context
    next()
  })
}

export const encryptPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10)
}

export const checkPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}

export const authenticateSocket = (socket: Socket, next: (err?: Error) => void): void => {
  try {
    // Extract token from handshake (supports both auth object and query param)
    const token = socket.handshake.auth?.token || socket.handshake.query.token

    if (!token || typeof token !== 'string') {
      console.error('Missing authentication token')
      next(new UnauthorizedException('MISSING_TOKEN')); return
    }

    // Verify JWT
    jwt.verify(token, Constants.TOKEN_SECRET, (err: Error | null, decoded: JwtPayload | string | undefined) => {
      if (err) {
        console.error('Invalid token:', err.message)
        next(new UnauthorizedException('INVALID_TOKEN')); return
      }

      if (typeof decoded === 'string' || !decoded?.userId) {
        next(new UnauthorizedException('INVALID_PAYLOAD')); return
      }
      console.log('User authenticated:', decoded.userId)

      // Store user ID in socket object
      socket.data.user = decoded.userId
      next()
    })
  } catch (error) {
    console.error('Authentication error:', error)
    next(new UnauthorizedException('AUTH_ERROR'))
  }
}
