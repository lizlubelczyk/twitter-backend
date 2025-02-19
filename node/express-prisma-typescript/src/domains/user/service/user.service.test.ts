import { UserServiceImpl } from './user.service.impl'
import { UserRepository } from '../repository'
import { FollowerRepository } from '../../follower/repository'
import { NotFoundException } from '../../../utils/errors'
import { OffsetPagination } from 'types'
import { UserDTO, UserViewDTO } from '../dto'
import { User } from '@prisma/client'

jest.mock('../repository')
jest.mock('../../follower/repository')

const mockUserRepository = {
  getById: jest.fn(),
  delete: jest.fn(),
  switchPrivacy: jest.fn(),
  isPrivate: jest.fn(),
  setProfilePicture: jest.fn(),
  getUsersByUsername: jest.fn()
} as unknown as jest.Mocked<UserRepository>

const mockFollowerRepository = {
  getFollowedUsersIds: jest.fn()
} as unknown as jest.Mocked<FollowerRepository>

const userService = new UserServiceImpl(mockUserRepository, mockFollowerRepository)

describe('UserServiceImpl', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getUser', () => {
    it('should return user when found', async () => {
      const user1: User = { id: 'user1', username: 'testuser', name: 'testuser', email: 'user1@gmail.com', private: false, profilePicture: 'http://example.com/pic.jpg', password: 'password', deletedAt: null, createdAt: new Date(), updatedAt: new Date() }
      const user = new UserViewDTO(user1)

      mockUserRepository.getById.mockResolvedValueOnce(user)

      const result = await userService.getUser(user1.id)

      expect(result).toEqual(user)
      expect(mockUserRepository.getById).toHaveBeenCalledWith(user1.id)
    })

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = 'user1'

      mockUserRepository.getById.mockResolvedValueOnce(null)

      await expect(userService.getUser(userId)).rejects.toThrow(NotFoundException)
    })
  })

  describe('getUserRecommendations', () => {
    it('should return recommended users', async () => {
      const userId = 'user1'
      const options: OffsetPagination = { limit: 10, skip: 0 }
      const followedUsers = ['user2', 'user3']
      const followedByFollowedUsers = ['user4', 'user5']
      const user4: User = { id: 'user4', username: 'user4name', name: 'user4name', email: 'user4@gmail.com', private: false, profilePicture: 'http://example.com/pic.jpg', password: 'password', deletedAt: null, createdAt: new Date(), updatedAt: new Date() }
      const user5: User = { id: 'user5', username: 'user5name', name: 'user5name', email: 'user5@gmail.com', private: false, profilePicture: 'http://example.com/pic.jpg', password: 'password', deletedAt: null, createdAt: new Date(), updatedAt: new Date() }
      const recommendedUsers = [
        new UserViewDTO(user4),
        new UserViewDTO(user5)
      ]

      mockFollowerRepository.getFollowedUsersIds.mockResolvedValueOnce(followedUsers)
      mockFollowerRepository.getFollowedUsersIds.mockResolvedValueOnce(followedByFollowedUsers)
      mockUserRepository.getById.mockImplementation(async (id) => recommendedUsers.find(u => u.id === id) ?? null)

      const result = await userService.getUserRecommendations(userId, options)

      expect(result).toEqual(recommendedUsers)
      expect(mockFollowerRepository.getFollowedUsersIds).toHaveBeenCalledWith(userId)
    })

    it('should return empty array if user follows no one', async () => {
      const userId = 'user1'
      const options: OffsetPagination = { limit: 10, skip: 0 }

      mockFollowerRepository.getFollowedUsersIds.mockResolvedValueOnce([])

      const result = await userService.getUserRecommendations(userId, options)

      expect(result).toEqual([])
      expect(mockFollowerRepository.getFollowedUsersIds).toHaveBeenCalledWith(userId)
    })
  })

  describe('deleteUser', () => {
    it('should delete the user', async () => {
      const userId = 'user1'

      await userService.deleteUser(userId)

      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId)
    })
  })

  describe('switchPrivacy', () => {
    it('should toggle user privacy', async () => {
      const user1: User = { id: 'user1', username: 'testuser', name: 'testuser', email: 'user1@gmail.com', password: 'password', private: false, profilePicture: 'http://example.com/pic.jpg', deletedAt: null, createdAt: new Date(), updatedAt: new Date() }
      const updatedUser = new UserDTO(user1)

      mockUserRepository.switchPrivacy.mockResolvedValueOnce(updatedUser)

      const result = await userService.switchPrivacy(user1.id)

      expect(result).toEqual(updatedUser)
      expect(mockUserRepository.switchPrivacy).toHaveBeenCalledWith(user1.id)
    })
  })

  describe('isPrivate', () => {
    it('should return user privacy status', async () => {
      const userId = 'user1'
      mockUserRepository.isPrivate.mockResolvedValueOnce(true)

      const result = await userService.isPrivate(userId)

      expect(result).toBe(true)
      expect(mockUserRepository.isPrivate).toHaveBeenCalledWith(userId)
    })
  })

  describe('setProfilePicture', () => {
    it('should update profile picture', async () => {
      const user1: User = { id: 'user1', username: 'testuser', name: 'testuser', email: 'user1@gmail.com', password: 'password', private: false, profilePicture: 'http://example.com/pic.jpg', deletedAt: null, createdAt: new Date(), updatedAt: new Date() }
      const pictureUrl = 'http://example.com/pic.jpg'
      const updatedUser = new UserDTO(user1)

      mockUserRepository.setProfilePicture.mockResolvedValueOnce(updatedUser)

      const result = await userService.setProfilePicture(user1.id, pictureUrl)

      expect(result).toEqual(updatedUser)
      expect(mockUserRepository.setProfilePicture).toHaveBeenCalledWith(user1.id, pictureUrl)
    })
  })

  describe('getUsersByUsername', () => {
    it('should return users matching the given usernames', async () => {
      const usernames = 'testuser'
      const options: OffsetPagination = { limit: 10, skip: 0 }
      const user1: User = { id: 'user1', username: 'testuser', name: 'testuser', email: 'user1@gmail.com', password: 'password', private: false, profilePicture: 'http://example.com/pic.jpg', deletedAt: null, createdAt: new Date(), updatedAt: new Date() }
      const users = [new UserViewDTO(user1)]

      mockUserRepository.getUsersByUsername.mockResolvedValueOnce(users)

      const result = await userService.getUsersByUsername(usernames, options)

      expect(result).toEqual(users)
      expect(mockUserRepository.getUsersByUsername).toHaveBeenCalledWith(usernames, options)
    })
  })
})
