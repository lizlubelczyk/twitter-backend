import { FollowerRepository } from '../repository'
import { FollowerService } from '../service/follower.service'
import { FollowDTO } from '../dto'

export class FollowerServiceImpl implements FollowerService {
  constructor (private readonly followerRepository: FollowerRepository) {}

  async follow (userId: string, followedId: string): Promise<FollowDTO> {
    await this.followerRepository.create(userId, followedId)
    return new FollowDTO({ followerId: userId, followedId })
  }

  async unfollow (userId: string, followedId: string): Promise<void> {
    await this.followerRepository.delete(userId, followedId)
  }

  async isFollowing (userId: string, followedId: string): Promise<boolean> {
    return await this.followerRepository.isFollowing(userId, followedId)
  }
}
