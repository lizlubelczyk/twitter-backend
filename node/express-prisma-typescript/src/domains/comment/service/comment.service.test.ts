import { CommentServiceImpl } from './comment.service.impl'
import { CommentRepositoryImpl } from '../repository'
import { CommentDTO, CreateCommentInputDTO } from '../dto'
import { db } from '../../../utils'

jest.mock('../repository')

const mockRepository = new CommentRepositoryImpl(db) as jest.Mocked<CommentRepositoryImpl>
const commentService = new CommentServiceImpl(mockRepository)

describe('CommentServiceImpl', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should call create on the repository with correct parameters', async () => {
      const userId = 'user1'
      const postId = 'post1'
      const data: CreateCommentInputDTO = { content: 'Test comment' }

      await commentService.create(userId, postId, data)

      expect(mockRepository.create).toHaveBeenCalledWith(userId, postId, data)
    })
  })

  describe('delete', () => {
    it('should call delete on the repository with correct parameter', async () => {
      const commentId = 'comment1'

      await commentService.delete(commentId)

      expect(mockRepository.delete).toHaveBeenCalledWith(commentId)
    })
  })

  describe('getByPostId', () => {
    it('should return comments for a given post ID', async () => {
      const postId = 'post1'
      const comments: CommentDTO[] = [{ id: 'comment1', content: 'Test comment', authorId: 'user1', parentId: 'post1', createdAt: new Date(), images: [] }]
      mockRepository.getByPostId.mockResolvedValueOnce(comments)

      const result = await commentService.getByPostId(postId)

      expect(result).toEqual(comments)
      expect(mockRepository.getByPostId).toHaveBeenCalledWith(postId, undefined, undefined)
    })
  })

  describe('isComment', () => {
    it('should return true if comment exists', async () => {
      const commentId = 'comment1'
      mockRepository.isComment.mockResolvedValueOnce(true)

      const result = await commentService.isComment(commentId)

      expect(result).toBe(true)
      expect(mockRepository.isComment).toHaveBeenCalledWith(commentId)
    })
  })

  describe('getByUserId', () => {
    it('should return comments for a given user ID', async () => {
      const userId = 'user1'
      const comments: CommentDTO[] = [{ id: 'comment1', content: 'Test comment', authorId: 'user1', parentId: 'post1', createdAt: new Date(), images: [] }]

      mockRepository.getByUserId.mockResolvedValueOnce(comments)

      const result = await commentService.getByUserId(userId)

      expect(result).toEqual(comments)
      expect(mockRepository.getByUserId).toHaveBeenCalledWith(userId, undefined, undefined)
    })
  })
})
