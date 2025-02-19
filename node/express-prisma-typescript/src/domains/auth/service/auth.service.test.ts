import { AuthServiceImpl } from './auth.service.impl'
import { SignupInputDTO, LoginInputDTO } from '../dto'
import {
  checkPassword,
  ConflictException,
  db,
  generateAccessToken,
  NotFoundException,
  UnauthorizedException
} from '../../../utils'
import { UserRepositoryImpl } from '../../user/repository'

jest.mock('../../user/repository')
jest.mock('../../../utils', () => ({
  ...jest.requireActual('../../../utils'),
  generateAccessToken: jest.fn()
}))

const mockRepository = new UserRepositoryImpl(db) as jest.Mocked<UserRepositoryImpl>
const authService = new AuthServiceImpl(mockRepository)

describe('AuthServiceImpl', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('signup', () => {
    it('should throw ConflictException if user already exists', async () => {
      mockRepository.getByEmailOrUsername.mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        name: 'Test User',
        createdAt: new Date(),
        private: false
      })
      const data: SignupInputDTO = { email: 'test@example.com', username: 'testuser', password: 'password' }

      await expect(authService.signup(data)).rejects.toThrow(ConflictException)
    })

    it('should create a new user and return a token', async () => {
      mockRepository.getByEmailOrUsername.mockResolvedValueOnce(null)
      mockRepository.create.mockResolvedValueOnce({ id: '1', name: 'testuser', createdAt: new Date(), private: false })

      const data: SignupInputDTO = { email: 'test@example.com', username: 'testuser', password: 'password' }

      const result = await authService.signup(data)

      expect(result).toHaveProperty('token')
      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'test@example.com', username: 'testuser' }))
    })
  })

  describe('login', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      mockRepository.getByEmailOrUsername.mockResolvedValueOnce(null)

      const data: LoginInputDTO = { email: 'test@example.com', username: 'testuser', password: 'password' }

      await expect(authService.login(data)).rejects.toThrow(NotFoundException)
    })

    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockRepository.getByEmailOrUsername.mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        name: 'Test User',
        createdAt: new Date(),
        private: false
      })
      const data: LoginInputDTO = { email: 'test@example.com', username: 'testuser', password: 'wrongpassword' }

      await expect(authService.login(data)).rejects.toThrow(UnauthorizedException)
    })
  })
})
