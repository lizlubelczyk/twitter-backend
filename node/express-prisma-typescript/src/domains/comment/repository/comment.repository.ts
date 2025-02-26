import {CreateCommentInputDTO } from '../dto/index'
import { Post } from '@prisma/client'

export interface CommentRepository {
  create: (userId: string, postId: string, data: CreateCommentInputDTO) => Promise<Post>
  delete: (commentId: string) => Promise<void>
  getByPostId: (postId: string, limit?: number, after?: string) => Promise<Post[]>
  isComment: (commentId: string) => Promise<boolean>
  getByUserId: (userId: string, limit?: number, after?: string) => Promise<Post[]>
  countByPostId: (postId: string) => Promise<number>
  isAuthor: (userId: string, commentId: string) => Promise<boolean>
}
