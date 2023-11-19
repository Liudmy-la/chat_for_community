import * as UserController from '../controllers/userController'

describe('UserController', () => {
  describe('getAllUsers', () => {
    it('should get all users successfully', async () => {
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue([{ id: 1, email: 'test@example.com' }]),
      }

      const mockAuthenticateUser = jest.fn((req, res, callback) => callback())

      const req = {} as any
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any

      await UserController.getAllUsers(req, res)

      expect(mockAuthenticateUser).toHaveBeenCalled()
      expect(mockDb.select().from().execute).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ users: [{ id: 1, email: 'test@example.com' }] })
    })
  })
})
