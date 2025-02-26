import { CommentRepository } from '@domains/comment/repository'
import { CommentService } from '@domains/comment/service/comment.service'
import { CommentDTO, CreateCommentInputDTO } from '@domains/comment/dto'
import { UserRepository } from '@domains/user/repository'
import { ReactionRepository } from '@domains/reaction/repository'

export class CommentServiceImpl implements CommentService {
  constructor (
    private readonly commentRepository: CommentRepository,
    private readonly userRepository: UserRepository,
    private readonly reactionRepository: ReactionRepository
  ) {}

  async create (userId: string, postId: string, data: CreateCommentInputDTO): Promise<CommentDTO> {
    const comment = await this.commentRepository.create(userId, postId, data)
    const [author, likes, retweets, comments] = await Promise.all([
      this.userRepository.getById(comment.authorId),
      this.reactionRepository.getByTypeAndPostId(comment.id, 'like'),
      this.reactionRepository.getByTypeAndPostId(comment.id, 'retweet'),
      this.getByPostId(comment.id)
    ])
    return {
      ...comment,
      author,
      likes,
      retweets,
      comments
    }
  }

  async delete (commentId: string): Promise<void> {
    await this.commentRepository.delete(commentId)
  }

  async getByPostId (postId: string, limit?: number, after?: string): Promise<CommentDTO[]> {
    const comments = await this.commentRepository.getByPostId(postId, limit, after)
    return await Promise.all(
      comments.map(async (comment) => {
        const [author, likes, retweets, comments] = await Promise.all([
          this.userRepository.getById(comment.authorId),
          this.reactionRepository.getByTypeAndPostId(comment.id, 'like'),
          this.reactionRepository.getByTypeAndPostId(comment.id, 'retweet'),
          this.getByPostId(comment.id)
        ])
        return {
          ...comment,
          author,
          likes,
          retweets,
          comments
        }
      })
    )
  }

  async isComment (commentId: string): Promise<boolean> {
    return await this.commentRepository.isComment(commentId)
  }

  async getByUserId (userId: string, limit?: number, after?: string): Promise<CommentDTO[]> {
    const comments = await this.commentRepository.getByUserId(userId, limit, after)
    return await Promise.all(
      comments.map(async (comment) => {
        const [author, likes, retweets, comments] = await Promise.all([
          this.userRepository.getById(comment.authorId),
          this.reactionRepository.getByTypeAndPostId(comment.id, 'like'),
          this.reactionRepository.getByTypeAndPostId(comment.id, 'retweet'),
          this.getByPostId(comment.id)
        ])
        return {
          ...comment,
          author,
          likes,
          retweets,
          comments
        }
      })
    )
  }

  async isAuthor (userId: string, commentId: string): Promise<boolean> {
    return await this.commentRepository.isAuthor(userId, commentId)
  }
}
