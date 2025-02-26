import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { UserViewDTO } from '@domains/user/dto'
import { ReactionDTO } from '@domains/reaction/dto'
import { Post } from '@prisma/client'

export class CommentDTO {
  constructor (post: Post, author: UserViewDTO, comments: CommentDTO[], likes: ReactionDTO[], retweets: ReactionDTO[]) {
    this.id = post.id
    this.author = author
    this.content = post.content
    this.images = post.images
    this.createdAt = post.createdAt
    this.parentId = post.parentId
    this.comments = comments
    this.likes = likes
    this.retweets = retweets
  }

  id: string
  author: UserViewDTO | null
  content: string
  images: string[]
  createdAt: Date
  parentId: string | null
  comments: CommentDTO[]
  likes: ReactionDTO[]
  retweets: ReactionDTO[]
}

export class CreateCommentInputDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
    content!: string

  @IsOptional()
  @MaxLength(4)
    images?: string[]
}
