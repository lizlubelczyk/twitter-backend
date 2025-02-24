export class ReactionDTO {
  constructor (reaction: ReactionDTO) {
    this.id = reaction.id
    this.type = reaction.type
    this.createdAt = reaction.createdAt
    this.userId = reaction.userId
  }

  id: string
  type: string
  createdAt: Date
  userId: string
}
