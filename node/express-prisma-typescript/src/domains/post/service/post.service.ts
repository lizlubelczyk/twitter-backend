import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto'
import { OffsetPagination } from '@types'

export interface PostService {
  createPost: (userId: string, body: CreatePostInputDTO) => Promise<PostDTO>
  deletePost: (userId: string, postId: string) => Promise<void>
  getPost: (postId: string) => Promise<ExtendedPostDTO>
  getLatestPosts: (userId: string, options: OffsetPagination) => Promise<ExtendedPostDTO[]>
  getPostsByAuthor: (userId: any, authorId: string, options: OffsetPagination) => Promise<ExtendedPostDTO[]>
  getFollowingPosts: (userId: string, options: OffsetPagination) => Promise<ExtendedPostDTO[]>
}
