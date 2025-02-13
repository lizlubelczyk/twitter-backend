import { CommentDTO, CreateCommentInputDTO } from '../dto/index'

export interface CommentRepository {
  create: (userId: string, postId: string, data: CreateCommentInputDTO) => Promise<CommentDTO>
  delete: (commentId: string) => Promise<void>
  getByPostId: (postId: string, limit?: number, after?: string) => Promise<CommentDTO[]>
  isComment: (commentId: string) => Promise<boolean>
}
