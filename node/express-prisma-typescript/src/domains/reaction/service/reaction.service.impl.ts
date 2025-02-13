import { ReactionService } from '@domains/reaction/service/reaction.service'
import { ReactionRepository } from '@domains/reaction/repository'
import { PostRepository } from '@domains/post/repository'
import { PostDTO } from '@domains/post/dto'

export class ReactionServiceImpl implements ReactionService {
  private readonly reactionRepository: ReactionRepository
  private readonly postRepository: PostRepository

  constructor (reactionRepository: ReactionRepository, postRepository: PostRepository) {
    this.reactionRepository = reactionRepository
    this.postRepository = postRepository
  }

  async createReaction (userId: string, postId: string, type: string): Promise<void> {
    await this.reactionRepository.create(userId, postId, type)
  }

  async deleteReaction (userId: string, postId: string, type: string): Promise<void> {
    await this.reactionRepository.delete(userId, postId, type)
  }

  async hasReacted (userId: string, postId: string, type: string): Promise<boolean> {
    return await this.reactionRepository.hasReacted(userId, postId, type)
  }

  async getByUserIdAndType (userId: string, type: string, limit?: number, after?: string): Promise<PostDTO[]> {
    const postIds = await this.reactionRepository.getByUserIdAndType(userId, type, limit, after)
    return await this.postRepository.getByIds(postIds)
  }

}
