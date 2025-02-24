import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto'

export interface PostService {
  createPost: (userId: string, body: CreatePostInputDTO) => Promise<PostDTO>
  deletePost: (userId: string, postId: string) => Promise<void>
  getPost: (postId: string) => Promise<ExtendedPostDTO>
  getLatestPosts: (userId: string, options: { limit?: number, before?: string, after?: string }) => Promise<ExtendedPostDTO[]>
  getPostsByAuthor: (userId: any, authorId: string) => Promise<ExtendedPostDTO[]>
  getFollowingPosts: (userId: string, options: { limit?: number, before?: string, after?: string }) => Promise<ExtendedPostDTO[]>
}
