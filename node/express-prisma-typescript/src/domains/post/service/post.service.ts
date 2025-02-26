import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto'
import { OffsetPagination } from '@types'
import { CommentDTO } from '@domains/comment/dto'

export interface PostService {
  createPost: (userId: string, body: CreatePostInputDTO, parentId?: string) => Promise<PostDTO | CommentDTO>
  deletePost: (userId: string, postId: string) => Promise<void>
  getPost: (postId: string) => Promise<ExtendedPostDTO>
  getLatestPosts: (userId: string, options: OffsetPagination) => Promise<ExtendedPostDTO[]>
  getPostsByAuthor: (userId: any, authorId: string, options: OffsetPagination) => Promise<ExtendedPostDTO[]>
  getFollowingPosts: (userId: string, options: OffsetPagination) => Promise<ExtendedPostDTO[]>
}
