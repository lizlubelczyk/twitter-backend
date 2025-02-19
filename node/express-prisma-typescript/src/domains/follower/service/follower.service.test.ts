import { FollowerServiceImpl } from './follower.service.impl'
import { FollowerRepositoryImpl } from '../repository'
import { FollowDTO } from '../dto'
import { db } from '../../../utils'

jest.mock('../repository')

const mockRepository = new FollowerRepositoryImpl(db) as jest.Mocked<FollowerRepositoryImpl>
const followerService = new FollowerServiceImpl(mockRepository)

describe('FollowerServiceImpl', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('follow', () => {
    it('should call create on the repository with correct parameters', async () => {
      const userId = 'user1'
      const followedId = 'user2'
      const followDTO = new FollowDTO({ followerId: userId, followedId })

      await followerService.follow(userId, followedId)

      expect(mockRepository.create).toHaveBeenCalledWith(userId, followedId)
      expect(followDTO).toEqual(new FollowDTO({ followerId: userId, followedId }))
    })
  })

  describe('unfollow', () => {
    it('should call delete on the repository with correct parameters', async () => {
      const userId = 'user1'
      const followedId = 'user2'

      await followerService.unfollow(userId, followedId)

      expect(mockRepository.delete).toHaveBeenCalledWith(userId, followedId)
    })
  })

  describe('isFollowing', () => {
    it('should return true if user is following another user', async () => {
      const userId = 'user1'
      const followedId = 'user2'
      mockRepository.isFollowing.mockResolvedValueOnce(true)

      const result = await followerService.isFollowing(userId, followedId)

      expect(result).toBe(true)
      expect(mockRepository.isFollowing).toHaveBeenCalledWith(userId, followedId)
    })

    it('should return false if user is not following another user', async () => {
      const userId = 'user1'
      const followedId = 'user2'
      mockRepository.isFollowing.mockResolvedValueOnce(false)

      const result = await followerService.isFollowing(userId, followedId)

      expect(result).toBe(false)
      expect(mockRepository.isFollowing).toHaveBeenCalledWith(userId, followedId)
    })
  })
})
