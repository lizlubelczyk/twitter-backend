export class UserDTO {
  constructor (user: UserDTO) {
    this.id = user.id
    this.name = user.name
    this.createdAt = user.createdAt
    this.private = user.private
  }

  id: string
  name: string | null
  createdAt: Date
  private: boolean
}

export class ExtendedUserDTO extends UserDTO {
  constructor (user: ExtendedUserDTO) {
    super(user)
    this.email = user.email
    this.name = user.name
    this.password = user.password
  }

  email!: string
  username!: string
  password!: string
}
export class UserViewDTO {
  constructor (user: UserViewDTO) {
    this.id = user.id
    this.name = user.name
    this.username = user.username
    this.profilePicture = user.profilePicture
    this.private = user.private
  }

  id: string
  name: string | null
  username: string
  profilePicture: string | null
  private: boolean
}

export class UserProfileDTO {
  constructor (
    id: string,
    name: string | null | undefined,
    username: string | undefined,
    profilePicture: string | null | undefined,
    isPrivate: false | true | undefined,
    followers: string[],
    following: string[]
  ) {
    this.id = id
    this.name = name
    this.username = username
    this.profilePicture = profilePicture
    this.private = isPrivate
    this.followers = followers
    this.following = following
  }

  id: string
  name: string | null | undefined
  username: string | undefined
  profilePicture: string | null | undefined
  private: false | true | undefined
  followers: string[]
  following: string[]
}
