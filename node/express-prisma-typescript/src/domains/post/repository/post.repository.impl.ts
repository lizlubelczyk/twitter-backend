import { PrismaClient } from '@prisma/client'

import { OffsetPagination } from '@types'

import { PostRepository } from '.'
import { CreatePostInputDTO, PostDTO } from '../dto'

export class PostRepositoryImpl implements PostRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    const post = await this.db.post.create({
      data: {
        authorId: userId,
        ...data
      }
    })
    return new PostDTO(post)
  }

  async getAllByDatePaginatedAndFilter (options: OffsetPagination, followedUserIds: string[]): Promise<PostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        parentId: null,
        OR: [
          { authorId: { in: followedUserIds } },
          { author: { private: false } }
        ]
      },
      skip: options.skip,
      take: options.limit,
      orderBy: [
        {
          createdAt: 'desc'
        },
        {
          id: 'asc'
        }
      ]
    })
    return posts.map(post => new PostDTO(post))
  }

  async getByUsers (options: OffsetPagination, users: string[]): Promise<PostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        authorId: { in: users }
      },
      skip: options.skip,
      take: options.limit,
      orderBy: [
        {
          createdAt: 'desc'
        },
        {
          id: 'asc'
        }
      ]
    })
    return posts.map(post => new PostDTO(post))
  }

  async delete (postId: string): Promise<void> {
    await this.db.post.delete({
      where: {
        id: postId
      }
    })
  }

  async getById (postId: string): Promise<PostDTO | null> {
    const post = await this.db.post.findUnique({
      where: {
        id: postId
      }
    })
    return (post != null) ? new PostDTO(post) : null
  }

  async getByAuthorId (authorId: string, options: OffsetPagination): Promise<PostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        authorId
      },
      skip: options.skip,
      take: options.limit,
      orderBy: [
        {
          createdAt: 'desc'
        },
        {
          id: 'asc'
        }
      ]
    })
    return posts.map(post => new PostDTO(post))
  }

  async getByIds (postIds: string[]): Promise<PostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        id: { in: postIds }
      }
    })
    return posts.map(post => new PostDTO(post))
  }
}
