import { SignupInputDTO } from '@domains/auth/dto'
import { OffsetPagination } from '@types'
import { ExtendedUserDTO, UserDTO, UserViewDTO } from '../dto'

export interface UserRepository {
  create: (data: SignupInputDTO) => Promise<UserDTO>
  delete: (userId: string) => Promise<void>
  getRecommendedUsersPaginated: (options: OffsetPagination) => Promise<UserViewDTO[]>
  getById: (userId: string) => Promise<UserViewDTO | null>
  getByEmailOrUsername: (email?: string, username?: string) => Promise<ExtendedUserDTO | null>
  switchPrivacy: (userId: string) => Promise<UserDTO>
  getFollowedUsersIds: (userId: string) => Promise<string[]>
  isPrivate: (userId: string) => Promise<boolean>
  getByIdExtended: (userId: string) => Promise<ExtendedUserDTO>
  setProfilePicture: (userId: string, pictureUrl: string) => Promise<UserDTO>
  getUsersByUsername: (usernames: string, options: OffsetPagination) => Promise<UserViewDTO[]>
}
