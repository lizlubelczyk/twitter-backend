import { CommentDTO, CreateCommentInputDTO } from '@domains/comment/dto'

export interface CommentService {
  create: (userId: string, postId: string, data: CreateCommentInputDTO) => Promise<void>
  delete: (commentId: string) => Promise<void>
  getByPostId: (postId: string, limit?: number, after?: string) => Promise<CommentDTO[]>
  isComment: (commentId: string) => Promise<boolean>
  getByUserId: (userId: string, limit?: number, after?: string) => Promise<CommentDTO[]>
}
