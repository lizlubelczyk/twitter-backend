import { FollowerRepository } from '@domains/follower/repository/follower.repository'
import { PrismaClient } from '@prisma/client'
import { FollowDTO } from '@domains/follower/dto'

export class FollowerRepositoryImpl implements FollowerRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (followerId: string, followedId: string): Promise<FollowDTO> {
    const follow = await this.db.follow.create({
      data: {
        followerId,
        followedId
      }
    })
    return new FollowDTO(follow)
  }

  async delete (followerId: string, followedId: string): Promise<void> {
    await this.db.follow.delete({
      where: {
        followerId_followedId: {
          followerId,
          followedId
        } as any
      }
    })
  }

  async isFollowing (followerId: string, followedId: string): Promise<boolean> {
    const follow = await this.db.follow.findUnique({
      where: {
        followerId_followedId: {
          followerId: followerId,
          followedId: followedId
        } as any
      }
    })
    return follow != null
  }
}
