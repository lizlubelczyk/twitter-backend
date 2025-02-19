import { FollowDTO } from '@domains/follower/dto'

export interface FollowerService {
  follow: (followerId: string, followingId: string) => Promise<FollowDTO>
  unfollow: (followerId: string, followingId: string) => Promise<void>
  isFollowing: (followerId: string, followingId: string) => Promise<boolean>
}
