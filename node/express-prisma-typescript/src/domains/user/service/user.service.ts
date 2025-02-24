import { OffsetPagination } from '@types'
import { UserDTO, UserViewDTO } from '../dto'

export interface UserService {
  deleteUser: (userId: any) => Promise<void>
  getUser: (userId: any) => Promise<UserViewDTO>
  getUserRecommendations: (userId: any, options: OffsetPagination) => Promise<UserViewDTO[]>
  switchPrivacy: (userId: any) => Promise<UserDTO>
  isPrivate: (userId: any) => Promise<boolean>
  setProfilePicture: (userId: any, pictureUrl: string) => Promise<UserDTO>
  getUsersByUsername: (usernames: string, options: OffsetPagination) => Promise<UserViewDTO[]>
  getProfile: (userId: any) => Promise<UserViewDTO>
}
