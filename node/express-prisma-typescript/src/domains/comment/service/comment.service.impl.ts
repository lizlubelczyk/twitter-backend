import { CommentRepository } from '@domains/comment/repository'
import { CommentService } from '@domains/comment/service/comment.service'
import { CommentDTO, CreateCommentInputDTO } from '@domains/comment/dto'

export class CommentServiceImpl implements CommentService {
  constructor (private readonly commentRepository: CommentRepository) {}

  async create (userId: string, postId: string, data: CreateCommentInputDTO): Promise<void> {
    await this.commentRepository.create(userId, postId, data)
  }

  async delete (commentId: string): Promise<void> {
    await this.commentRepository.delete(commentId)
  }

  async getByPostId (postId: string, limit?: number, after?: string): Promise<CommentDTO[]> {
    const posts = await this.commentRepository.getByPostId(postId, limit, after)
    return posts
  }

  async isComment (commentId: string): Promise<boolean> {
    return await this.commentRepository.isComment(commentId)
  }

  async getByUserId (userId: string, limit?: number, after?: string): Promise<CommentDTO[]> {
    const comments = await this.commentRepository.getByUserId(userId, limit, after)
    return comments
  }

  async isAuthor (userId: string, commentId: string): Promise<boolean> {
    return await this.commentRepository.isAuthor(userId, commentId)
  }
}
