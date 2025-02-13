export interface ReactionService {
  createReaction: (userId: string, postId: string, type: string) => Promise<void>
  deleteReaction: (userId: string, postId: string, type: string) => Promise<void>
  hasReacted: (userId: string, postId: string, type: string) => Promise<boolean>
}
