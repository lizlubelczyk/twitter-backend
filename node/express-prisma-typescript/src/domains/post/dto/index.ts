import { ArrayMaxSize, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { ExtendedUserDTO } from '@domains/user/dto'
import { CommentDTO } from '@domains/comment/dto'
import { Reaction } from '@prisma/client'
import { ReactionDTO } from '@domains/reaction/dto'

export class CreatePostInputDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
    content!: string

  @IsOptional()
  @ArrayMaxSize(4)
    images?: string[]
}

export class PostDTO {
  constructor (post: PostDTO) {
    this.id = post.id
    this.authorId = post.authorId
    this.content = post.content
    this.images = post.images
    this.createdAt = post.createdAt
  }

  id: string
  authorId: string
  content: string
  images: string[]
  createdAt: Date
}

export class ExtendedPostDTO extends PostDTO {
  constructor (post: ExtendedPostDTO, author: ExtendedUserDTO, comments: CommentDTO[], likes: ReactionDTO[], retweets: ReactionDTO[]) {
    super(post)
    this.author = author
    this.comments = comments
    this.likes = likes
    this.retweets = retweets
  }

  author: ExtendedUserDTO
  comments: CommentDTO[]
  likes: ReactionDTO[]
  retweets: ReactionDTO[]
}
