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

  async getPost (userId: string, postId: string): Promise<ExtendedPostDTO> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')

    const [likeCount, retweetCount, commentCount, author] = await Promise.all([
      this.reactionRepository.countByPostIdAndType(postId, 'like'),
      this.reactionRepository.countByPostIdAndType(postId, 'retweet'),
      this.commentRepository.countByPostId(postId),
      this.userRepository.getByIdExtended(post.authorId)
    ])

    return {
      ...post,
      qtyComments: commentCount,
      qtyLikes: likeCount,
      qtyRetweets: retweetCount,
      author
    }
  }

  async getLatestPosts (userId: string, options: CursorPagination): Promise<PostDTO[]> {
    const followedUserIds = await this.userRepository.getFollowedUsersIds(userId)
    return await this.repository.getAllByDatePaginatedAndFilter(options, followedUserIds)
  }

  async getPostsByAuthor (userId: string, authorId: string): Promise<ExtendedPostDTO[]> {
    const posts = await this.repository.getByAuthorId(authorId)

    return await Promise.all(
      posts.map(async (post) => {
        const [likeCount, retweetCount, commentCount, author] = await Promise.all([
          this.reactionRepository.countByPostIdAndType(post.id, 'like'),
          this.reactionRepository.countByPostIdAndType(post.id, 'retweet'),
          this.commentRepository.countByPostId(post.id),
          this.userRepository.getByIdExtended(post.authorId)
        ])

        return {
          ...post,
          qtyComments: commentCount,
          qtyLikes: likeCount,
          qtyRetweets: retweetCount,
          author
        }
      })
    )
  }
}
