export interface ReactionRepository {
  create: (userId: string, postId: string, type: string) => Promise<void>
  delete: (userId: string, postId: string, type: string) => Promise<void>
  hasReacted: (userId: string, postId: string, type: string) => Promise<boolean>
  getByUserIdAndType: (userId: string, type: string, limit?: number, after?: string) => Promise<string[]>
  countByPostIdAndType: (postId: string, type: string, limit?: number, after?: string) => Promise<number>
}
