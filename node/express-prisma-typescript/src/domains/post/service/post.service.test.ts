import { PostServiceImpl } from './post.service.impl'
import { PostRepository } from '../repository'
import { UserRepository } from '../../user/repository'
import { ReactionRepository } from '../../reaction/repository'
import { CommentRepository } from '../../comment/repository'
import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto'
import { CursorPagination } from '@types'
import { ForbiddenException, NotFoundException } from '../../../utils'

jest.mock('../repository')
jest.mock('../../user/repository')
jest.mock('../../reaction/repository')
jest.mock('../../comment/repository')

const mockPostRepository = {
  create: jest.fn(),
  delete: jest.fn(),
  getById: jest.fn(),
  getAllByDatePaginatedAndFilter: jest.fn(),
  getByAuthorId: jest.fn()
} as unknown as jest.Mocked<PostRepository>

const mockUserRepository = {
  getByIdExtended: jest.fn(),
  getFollowedUsersIds: jest.fn()
} as unknown as jest.Mocked<UserRepository>

const mockReactionRepository = {
  countByPostIdAndType: jest.fn()
} as unknown as jest.Mocked<ReactionRepository>

const mockCommentRepository = {
  countByPostId: jest.fn()
} as unknown as jest.Mocked<CommentRepository>

const postService = new PostServiceImpl(
  mockPostRepository,
  mockUserRepository,
  mockReactionRepository,
  mockCommentRepository
)

describe('PostServiceImpl', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createPost', () => {
    it('should create a new post', async () => {
      const userId = 'user1'
      const data: CreatePostInputDTO = { content: 'Test post' }
      const createdPost: PostDTO = { id: 'post1', content: 'Test post', authorId: userId, createdAt: new Date(), images: [] }

      mockPostRepository.create.mockResolvedValueOnce(createdPost)

      const result = await postService.createPost(userId, data)

      expect(result).toEqual(createdPost)
      expect(mockPostRepository.create).toHaveBeenCalledWith(userId, data)
    })
  })

  describe('deletePost', () => {
    it('should delete a post when user is the author', async () => {
      const userId = 'user1'
      const postId = 'post1'
      const post = { id: postId, authorId: userId, content: 'Test post', createdAt: new Date(), images: [] }

      mockPostRepository.getById.mockResolvedValueOnce(post)
      mockPostRepository.delete.mockResolvedValueOnce()

      await postService.deletePost(userId, postId)

      expect(mockPostRepository.delete).toHaveBeenCalledWith(postId)
    })

    it('should throw NotFoundException if post does not exist', async () => {
      const userId = 'user1'
      const postId = 'post1'

      mockPostRepository.getById.mockResolvedValueOnce(null)

      await expect(postService.deletePost(userId, postId)).rejects.toThrow(NotFoundException)
    })

    it('should throw ForbiddenException if user is not the author', async () => {
      const userId = 'user1'
      const postId = 'post1'
      const post = { id: postId, authorId: 'otherUser', content: 'Test post', createdAt: new Date(), images: [] }

      mockPostRepository.getById.mockResolvedValueOnce(post)

      await expect(postService.deletePost(userId, postId)).rejects.toThrow(ForbiddenException)
    })
  })

  describe('getPost', () => {
    it('should return post with reactions and author details', async () => {
      const userId = 'user1'
      const postId = 'post1'
      const likeCount = 5
      const retweetCount = 3
      const commentCount = 2
      const author = { id: 'author1', name: 'Author Name', email: 'user@gmail.com', createdAt: new Date(), password: 'password', username: 'author1', private: false }
      const post: ExtendedPostDTO = {
        id: postId,
        content: 'Test post',
        authorId: userId,
        createdAt: new Date(),
        images: [],
        author,
        qtyComments: commentCount,
        qtyLikes: likeCount,
        qtyRetweets: retweetCount
      }

      mockPostRepository.getById.mockResolvedValueOnce(post)
      mockReactionRepository.countByPostIdAndType.mockResolvedValueOnce(likeCount)
      mockReactionRepository.countByPostIdAndType.mockResolvedValueOnce(retweetCount)
      mockCommentRepository.countByPostId.mockResolvedValueOnce(commentCount)
      mockUserRepository.getByIdExtended.mockResolvedValueOnce(author)

      const result = await postService.getPost(userId, postId)

      expect(result).toEqual(post)
      expect(mockPostRepository.getById).toHaveBeenCalledWith(postId)
    })

    it('should throw NotFoundException if post does not exist', async () => {
      const postId = 'post1'
      mockPostRepository.getById.mockResolvedValueOnce(null)

      await expect(postService.getPost('user1', postId)).rejects.toThrow(NotFoundException)
    })
  })

  describe('getLatestPosts', () => {
    it('should return paginated posts filtered by followed users', async () => {
      const userId = 'user1'
      const options: CursorPagination = { limit: 10, before: undefined, after: undefined }
      const followedUsers = ['user2', 'user3']
      const posts: PostDTO[] = [{ id: 'post1', content: 'Test post', authorId: 'user2', createdAt: new Date(), images: [] }]

      mockUserRepository.getFollowedUsersIds.mockResolvedValueOnce(followedUsers)
      mockPostRepository.getAllByDatePaginatedAndFilter.mockResolvedValueOnce(posts)

      const result = await postService.getLatestPosts(userId, options)

      expect(result).toEqual(posts)
      expect(mockPostRepository.getAllByDatePaginatedAndFilter).toHaveBeenCalledWith(options, followedUsers)
    })
  })

  describe('getPostsByAuthor', () => {
    it('should return all posts by a specific author', async () => {
      const userId = 'user1'
      const authorId = 'author1'
      const posts: ExtendedPostDTO[] = [{
        id: 'post1',
        content: 'Test post',
        authorId,
        createdAt: new Date(),
        images: [],
        author: { id: authorId, name: 'Author Name', email: 'testuser@gmail.com', createdAt: new Date(), password: 'password', username: 'author1', private: false },
        qtyComments: 2,
        qtyLikes: 5,
        qtyRetweets: 3
      }]

      mockPostRepository.getByAuthorId.mockResolvedValueOnce(posts)
      mockReactionRepository.countByPostIdAndType.mockResolvedValueOnce(5)
      mockReactionRepository.countByPostIdAndType.mockResolvedValueOnce(3)
      mockCommentRepository.countByPostId.mockResolvedValueOnce(2)
      mockUserRepository.getByIdExtended.mockResolvedValueOnce(posts[0].author)

      const result = await postService.getPostsByAuthor(userId, authorId)

      expect(result).toEqual(posts)
      expect(mockPostRepository.getByAuthorId).toHaveBeenCalledWith(authorId)
    })
  })
})
