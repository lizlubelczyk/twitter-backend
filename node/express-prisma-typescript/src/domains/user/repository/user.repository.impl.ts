import { SignupInputDTO } from '@domains/auth/dto'
import { PrismaClient } from '@prisma/client'
import { OffsetPagination } from '@types'
import { ExtendedUserDTO, UserDTO } from '../dto'
import { UserRepository } from './user.repository'

export class UserRepositoryImpl implements UserRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (data: SignupInputDTO): Promise<UserDTO> {
    return await this.db.user.create({
      data
    }).then(user => new UserDTO(user))
  }

  async getById (userId: any): Promise<UserDTO | null> {
    const user = await this.db.user.findUnique({
      where: {
        id: userId
      }
    })
    return user ? new UserDTO(user) : null
  }

  async delete (userId: any): Promise<void> {
    await this.db.user.delete({
      where: {
        id: userId
      }
    })
  }

  async getRecommendedUsersPaginated (options: OffsetPagination): Promise<UserDTO[]> {
    const users = await this.db.user.findMany({
      take: options.limit ? options.limit : undefined,
      skip: options.skip ? options.skip : undefined,
      orderBy: [
        {
          id: 'asc'
        }
      ]
    })
    return users.map(user => new UserDTO(user))
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
}
