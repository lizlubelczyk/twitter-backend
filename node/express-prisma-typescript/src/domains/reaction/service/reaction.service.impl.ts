import { ReactionService } from '@domains/reaction/service/reaction.service'
import { ReactionRepository } from '@domains/reaction/repository'

export class ReactionServiceImpl implements ReactionService {
  private readonly reactionRepository: ReactionRepository

  constructor (reactionRepository: ReactionRepository) {
    this.reactionRepository = reactionRepository
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
}
