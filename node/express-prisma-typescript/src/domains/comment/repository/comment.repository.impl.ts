import { CreateCommentInputDTO } from '../dto'
import { Post, PrismaClient } from '@prisma/client'
import { CommentRepository } from './comment.repository'

export class CommentRepositoryImpl implements CommentRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (userId: string, postId: string, data: CreateCommentInputDTO): Promise<Post> {
    const comment = await this.db.post.create({
      data: {
        authorId: userId,
        parentId: postId,
        ...data
      }
    })
    return comment
  }

  async delete (commentId: string): Promise<void> {
    await this.db.post.delete({
      where: {
        id: commentId
      }
    })
  }

  async getByPostId (postId: string, limit?: number, after?: string): Promise<Post[]> {
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
    return comments
  }

  async isComment (commentId: string): Promise<boolean> {
    return (await this.db.post.findUnique({
      where: {
        id: commentId
      }
    })) != null
  }

  async getByUserId (userId: string, limit?: number, after?: string): Promise<Post[]> {
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
    return comments
  }

  async countByPostId (postId: string): Promise<number> {
    return await this.db.post.count({
      where: {
        parentId: postId
      }
    })
  }

  async isAuthor (userId: string, commentId: string): Promise<boolean> {
    const comment = await this.db.post.findUnique({
      where: {
        id: commentId
      }
    })
    return comment?.authorId === userId
  }
}
