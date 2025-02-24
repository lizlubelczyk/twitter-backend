import { NotFoundException } from '../../../utils/errors'
import { OffsetPagination } from 'types'
import { UserDTO, UserViewDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'
import { FollowerRepository } from '../../follower/repository'

export class UserServiceImpl implements UserService {
  constructor (private readonly repository: UserRepository, private readonly followerRepository: FollowerRepository) {}

  async getUser (userId: any): Promise<UserViewDTO> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    return user
  }

  async getUserRecommendations (userId: any, options: OffsetPagination): Promise<UserViewDTO[]> {
    const followedUsersIds = await this.followerRepository.getFollowedUsersIds(userId)
    if (followedUsersIds === null || followedUsersIds.length === 0) {
      return []
    }

    const followedByFollowedUsersIds = await Promise.all(
      followedUsersIds.map(async id => await this.followerRepository.getFollowedUsersIds(id))
    )
    const recommendedUsersIds = followedByFollowedUsersIds.flat()
    const uniqueRecommendedUsersIds = recommendedUsersIds.filter(id => !followedUsersIds.includes(id) && id !== userId)

    const skip = options.skip ?? 0
    const limit = options.limit ?? 10

    const paginatedRecommendedUsersIds = uniqueRecommendedUsersIds.slice(skip, skip + limit)
    const recommendedUsers = await Promise.all(
      paginatedRecommendedUsersIds.map(async id => await this.repository.getById(id))
    )

    return recommendedUsers.filter((user): user is UserViewDTO => user !== null).map(user => new UserViewDTO(user.id, user.name, user.username, user.profilePicture, user.private, [], []))
  }

  async deleteUser (userId: any): Promise<void> {
    await this.repository.delete(userId)
  }

  async switchPrivacy (userId: any): Promise<UserDTO> {
    return await this.repository.switchPrivacy(userId)
  }

  async isPrivate (userId: any): Promise<boolean> {
    return await this.repository.isPrivate(userId)
  }

  async setProfilePicture (userId: string, pictureUrl: string): Promise<UserDTO> {
    console.log('userId', userId)
    return await this.repository.setProfilePicture(userId, pictureUrl)
  }

  async getUsersByUsername (usernames: string, options: OffsetPagination): Promise<UserViewDTO[]> {
    return await this.repository.getUsersByUsername(usernames, options)
  }

  async getProfile (userId: any): Promise<UserViewDTO> {
    const user = await this.repository.getById(userId)
    const followedUsersIds = await this.followerRepository.getFollowedUsersIds(userId)
    const followersIds = await this.followerRepository.getFollowersIds(userId)
    return new UserViewDTO(userId, user?.name, user?.username, user?.profilePicture, user?.private, followersIds, followedUsersIds)
  }
}
