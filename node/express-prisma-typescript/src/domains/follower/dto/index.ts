export class FollowDTO {
  constructor (follow: FollowDTO) {
    this.followerId = follow.followerId
    this.followedId = follow.followedId
  }

  followerId: string
  followedId: string
}
