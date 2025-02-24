import { PostDTO } from '@domains/post/dto'
import { ReactionDTO } from '@domains/reaction/dto'

export interface ReactionService {
  createReaction: (userId: string, postId: string, type: string) => Promise<void>
  deleteReaction: (userId: string, postId: string, type: string) => Promise<void>
  hasReacted: (userId: string, postId: string, type: string) => Promise<boolean>
  getByUserIdAndType: (userId: string, type: string, limit?: number, after?: string) => Promise<PostDTO[]>
  getByTypeAndPostId: (postId: string, type: string) => Promise<ReactionDTO[]>
}
