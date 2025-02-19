import { CommentDTO, CreateCommentInputDTO } from '../dto'
import { PrismaClient } from '@prisma/client'
import { CommentRepository } from './comment.repository'

export class CommentRepositoryImpl implements CommentRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (userId: string, postId: string, data: CreateCommentInputDTO): Promise<CommentDTO> {
    const comment = await this.db.post.create({
      data: {
        authorId: userId,
        parentId: postId,
        ...data
      }
    })
    return new CommentDTO(comment)
  }

  async delete (commentId: string): Promise<void> {
    await this.db.post.delete({
      where: {
        id: commentId
      }
    })
  }

  async getByPostId (postId: string, limit?: number, after?: string): Promise<CommentDTO[]> {
    const comments = await this.db.post.findMany({
      where: {
        parentId: postId
      },
      take: limit,
      skip: after ? 1 : 0,
      cursor: after
        ? {
            id: after
          }
        : undefined,
      orderBy: {
        createdAt: 'desc'
      }
    })
    return comments.map(comment => new CommentDTO(comment))
  }

  async isComment (commentId: string): Promise<boolean> {
    return await this.db.post.findUnique({
      where: {
        id: commentId
      }
    }) != null
  }

  async getByUserId (userId: string, limit?: number, after?: string): Promise<CommentDTO[]> {
    const comments = await this.db.post.findMany({
      where: {
        authorId: userId
      },
      take: limit,
      skip: after ? 1 : 0,
      cursor: after
        ? {
            id: after
          }
        : undefined,
      orderBy: {
        createdAt: 'desc'
      }
    })
    return comments.map(comment => new CommentDTO(comment))
  }

  async countByPostId (postId: string): Promise<number> {
    return await this.db.post.count({
      where: {
        parentId: postId
      }
    })
  }
}
