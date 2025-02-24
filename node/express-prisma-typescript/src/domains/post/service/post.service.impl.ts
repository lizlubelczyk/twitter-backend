import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { validate } from 'class-validator'
import { CursorPagination } from '@types'
import { UserRepository } from '../../user/repository'
import { ReactionRepository } from '../../reaction/repository'
import { CommentRepository } from '../../comment/repository'
import { ForbiddenException, NotFoundException } from '../../../utils'

export class PostServiceImpl implements PostService {
  constructor (
    private readonly repository: PostRepository,
    private readonly userRepository: UserRepository,
    private readonly reactionRepository: ReactionRepository,
    private readonly commentRepository: CommentRepository
  ) {}

  async createPost (userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    await validate(data)
    return await this.repository.create(userId, data)
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
      this.commentRepository.getByPostId(postId),
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

  async getLatestPosts (userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    const followedUserIds = await this.userRepository.getFollowedUsersIds(userId)
    const posts = await this.repository.getAllByDatePaginatedAndFilter(options, followedUserIds)

    return await Promise.all(
      posts.map(async (post) => {
        const [likes, retweets, comments, author] = await Promise.all([
          this.reactionRepository.getByTypeAndPostId(post.id, 'like'),
          this.reactionRepository.getByTypeAndPostId(post.id, 'retweet'),
          this.commentRepository.getByPostId(post.id),
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

  async getPostsByAuthor (userId: string, authorId: string): Promise<ExtendedPostDTO[]> {
    const posts = await this.repository.getByAuthorId(authorId)

    return await Promise.all(
      posts.map(async (post) => {
        const [likes, retweets, comments, author] = await Promise.all([
          this.reactionRepository.getByTypeAndPostId(post.id, 'like'),
          this.reactionRepository.getByTypeAndPostId(post.id, 'retweet'),
          this.commentRepository.getByPostId(post.id),
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

  async getFollowingPosts (userId: string, options: CursorPagination): Promise<PostDTO[]> {
    const followedUserIds = await this.userRepository.getFollowedUsersIds(userId)
    return await this.repository.getByUsers(options, followedUserIds)
  }
}
