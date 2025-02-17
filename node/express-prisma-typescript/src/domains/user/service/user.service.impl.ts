import { NotFoundException } from '@utils/errors'
import { OffsetPagination } from 'types'
import { UserDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'

export class UserServiceImpl implements UserService {
  constructor (private readonly repository: UserRepository) {}

  async getUser (userId: any): Promise<UserDTO> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    return user
  }

  async getUserRecommendations (userId: any, options: OffsetPagination): Promise<UserDTO[]> {
    // TODO: make this return only users followed by users the original user follows
    return await this.repository.getRecommendedUsersPaginated(options)
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
}
