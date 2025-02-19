import { FollowDTO } from '@domains/follower/dto'

export interface FollowerRepository {
  create: (userId: string, followedId: string) => Promise<FollowDTO>
  delete: (userId: string, followedId: string) => Promise<void>
  isFollowing: (userId: string, followedId: string) => Promise<boolean>
  getFollowedUsersIds: (userId: string) => Promise<string[]>
}
