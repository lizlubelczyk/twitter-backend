import { CursorPagination, OffsetPagination } from '@types'
import { CreatePostInputDTO, PostDTO } from '../dto'

export interface PostRepository {
  create: (userId: string, data: CreatePostInputDTO) => Promise<PostDTO>
  getAllByDatePaginatedAndFilter: (options: CursorPagination, followedUserIds: string[]) => Promise<PostDTO[]>
  delete: (postId: string) => Promise<void>
  getById: (postId: string) => Promise<PostDTO | null>
  getByAuthorId: (authorId: string, options: OffsetPagination) => Promise<PostDTO[]>
  getByIds: (postIds: string[]) => Promise<PostDTO[]>
  getByUsers: (options: OffsetPagination, users: string[]) => Promise<PostDTO[]>
}
