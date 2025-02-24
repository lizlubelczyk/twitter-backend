import { SignupInputDTO } from '@domains/auth/dto'
import { PrismaClient } from '@prisma/client'
import { OffsetPagination } from '@types'
import { ExtendedUserDTO, UserDTO, UserViewDTO } from '../dto'
import { UserRepository } from './user.repository'
import { isUUID } from 'class-validator'

export class UserRepositoryImpl implements UserRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (data: SignupInputDTO): Promise<UserDTO> {
    return await this.db.user.create({
      data
    }).then(user => new UserDTO(user))
  }

  async getById (userId: string): Promise<UserViewDTO | null> {
    if (!isUUID(userId)) {
      return null
    }
    const user = await this.db.user.findUnique({
      where: {
        id: userId
      }
    })
    return user ? new UserViewDTO(user.id, user.name, user.username, user.profilePicture, user.private, [], []) : null
  }

  async delete (userId: any): Promise<void> {
    await this.db.user.delete({
      where: {
        id: userId
      }
    })
  }

  async getRecommendedUsersPaginated (options: OffsetPagination): Promise<UserViewDTO[]> {
    const users = await this.db.user.findMany({
      take: options.limit ? options.limit : undefined,
      skip: options.skip ? options.skip : undefined,
      orderBy: [
        {
          id: 'asc'
        }
      ]
    })
    return users.map(user => new UserViewDTO(user.id, user.name, user.username, user.profilePicture, user.private, [], []))
  }

  async getByEmailOrUsername (email?: string, username?: string): Promise<ExtendedUserDTO | null> {
    const user = await this.db.user.findFirst({
      where: {
        OR: [
          {
            email
          },
          {
            username
          }
        ]
      }
    })
    return user ? new ExtendedUserDTO(user) : null
  }

  async switchPrivacy (userId: string): Promise<UserDTO> {
    const user = await this.db.user.findUnique({
      where: {
        id: userId
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const updatedUser = await this.db.user.update({
      where: {
        id: userId
      },
      data: {
        private: !user.private
      }
    })

    return new UserDTO(updatedUser)
  }

  async getFollowedUsersIds (userId: string): Promise<string[]> {
    const user = await this.db.user.findUnique({
      where: {
        id: userId
      },
      include: {
        follows: true
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user.follows.map((follow: { followedId: string }) => follow.followedId)
  }

  async isPrivate (userId: string): Promise<boolean> {
    const user = await this.db.user.findUnique({
      where: {
        id: userId
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user.private
  }

  async getByIdExtended (userId: string): Promise<ExtendedUserDTO> {
    const user = await this.db.user.findUnique({
      where: {
        id: userId
      }
    })
    if (!user) {
      throw new Error('User not found')
    }
    return new ExtendedUserDTO(user)
  }

  async setProfilePicture (userId: string, pictureUrl: string): Promise<UserDTO> {
    console.log('userId', userId)
    const user = await this.db.user.update({
      where: {
        id: userId
      },
      data: {
        profilePicture: pictureUrl
      }
    })
    return new UserDTO(user)
  }

  async getUsersByUsername (username: string, options: OffsetPagination): Promise<UserViewDTO[]> {
    const users = await this.db.user.findMany({
      where: {
        username: {
          contains: username,
          mode: 'insensitive'
        }
      },
      take: options.limit ? options.limit : undefined,
      skip: options.skip ? options.skip : undefined,
      orderBy: [
        {
          username: 'asc'
        }
      ]
    })
    return users.map(user => new UserViewDTO(user.id, user.name, user.username, user.profilePicture, user.private, [], []))
  }
}
