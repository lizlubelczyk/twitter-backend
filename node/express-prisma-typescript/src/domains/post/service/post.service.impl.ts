import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { validate } from 'class-validator'
import { OffsetPagination } from '@types'
import { UserRepository } from '../../user/repository'
import { ReactionRepository } from '../../reaction/repository'
import { ForbiddenException, NotFoundException } from '../../../utils'
import { CommentService } from '@domains/comment/service'
import { CommentDTO } from '@domains/comment/dto'

export class PostServiceImpl implements PostService {
  constructor (
    private readonly repository: PostRepository,
    private readonly userRepository: UserRepository,
    private readonly reactionRepository: ReactionRepository,
    private readonly commentService: CommentService
  ) {}

  async createPost (userId: string, data: CreatePostInputDTO, parentId?: string): Promise<ExtendedPostDTO | CommentDTO> {
    await validate(data)
    if (parentId) {
      return await this.commentService.create(userId, parentId, data)
    }
    const post = await this.repository.create(userId, data)
    const author = await this.userRepository.getById(post.authorId)
    const likes = await this.reactionRepository.getByTypeAndPostId(post.id, 'like')
    const retweets = await this.reactionRepository.getByTypeAndPostId(post.id, 'retweet')
    const comments = await this.commentService.getByPostId(post.id)
    return {
      ...post,
      author,
      likes,
      retweets,
      comments
    }
  }

  async deletePost (userId: string, postId: string): Promise<void> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    if (post.authorId !== userId) throw new ForbiddenException()
    await this.repository.delete(postId)
  }

  async getPost (postId: string): Promise<ExtendedPostDTO> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')

    const [likes, retweets, comments, author] = await Promise.all([
      this.reactionRepository.getByTypeAndPostId(postId, 'like'),
      this.reactionRepository.getByTypeAndPostId(postId, 'retweet'),
      this.commentService.getByPostId(postId),
      this.userRepository.getById(post.authorId)
    ])

    return {
      ...post,
      likes,
      retweets,
      comments,
      author
    }
  }

  async getLatestPosts (userId: string, options: OffsetPagination): Promise<ExtendedPostDTO[]> {
    const followedUserIds = await this.userRepository.getFollowedUsersIds(userId)
    const posts = await this.repository.getAllByDatePaginatedAndFilter(options, followedUserIds)

    return await Promise.all(
      posts.map(async (post) => {
        const [likes, retweets, comments, author] = await Promise.all([
          this.reactionRepository.getByTypeAndPostId(post.id, 'like'),
          this.reactionRepository.getByTypeAndPostId(post.id, 'retweet'),
          this.commentService.getByPostId(post.id),
          this.userRepository.getById(post.authorId)
        ])

        return {
          ...post,
          likes,
          retweets,
          comments,
          author
        }
      })
    )
  }

  async getPostsByAuthor (userId: string, authorId: string, options: OffsetPagination): Promise<ExtendedPostDTO[]> {
    const posts = await this.repository.getByAuthorId(authorId, options)

    return await Promise.all(
      posts.map(async (post) => {
        const [likes, retweets, comments, author] = await Promise.all([
          this.reactionRepository.getByTypeAndPostId(post.id, 'like'),
          this.reactionRepository.getByTypeAndPostId(post.id, 'retweet'),
          this.commentService.getByPostId(post.id),
          this.userRepository.getById(post.authorId)
        ])

        return {
          ...post,
          likes,
          retweets,
          comments,
          author
        }
      })
    )
  }

  async getFollowingPosts (userId: string, options: OffsetPagination): Promise<ExtendedPostDTO[]> {
    const followedUserIds = await this.userRepository.getFollowedUsersIds(userId)
    const posts = await this.repository.getByUsers(options, followedUserIds)

    return await Promise.all(
      posts.map(async (post) => {
        const [likes, retweets, comments, author] = await Promise.all([
          this.reactionRepository.getByTypeAndPostId(post.id, 'like'),
          this.reactionRepository.getByTypeAndPostId(post.id, 'retweet'),
          this.commentService.getByPostId(post.id),
          this.userRepository.getById(post.authorId)
        ])

        return {
          ...post,
          likes,
          retweets,
          comments,
          author
        }
      })
    )
  }
}
