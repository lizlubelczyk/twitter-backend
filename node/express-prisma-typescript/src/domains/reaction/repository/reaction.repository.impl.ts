import { PrismaClient } from '@prisma/client'
import { ReactionRepository } from '@domains/reaction/repository/reaction.repository'

export class ReactionRepositoryImpl implements ReactionRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (userId: string, postId: string, type: string): Promise<void> {
    await this.db.reaction.create({
      data: {
        userId,
        postId,
        type
      }
    })
  }

  async delete (userId: string, postId: string, type: string): Promise<void> {
    await this.db.reaction.delete({
      where: {
        userId_postId_type: {
          userId,
          postId,
          type
        }
      }
    })
  }

  async hasReacted (userId: string, postId: string, type: string): Promise<boolean> {
    const reaction = await this.db.reaction.findUnique({
      where: {
        userId_postId_type: {
          userId,
          postId,
          type
        }
      }
    })
    return reaction != null
  }

  async getByUserIdAndType (userId: string, type: string, limit? : number, after? : string): Promise<string[]> {
    const reactions = await this.db.reaction.findMany({
      where: {
        userId,
        type
      },
      take: limit,
      skip: after ? 1 : 0,
      cursor: after ? {
        id: after
      } : undefined,
      orderBy: {
        createdAt: 'desc'
      }
    })
    return reactions.map(reaction => reaction.postId)
  }
}
