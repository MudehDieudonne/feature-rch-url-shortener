import request from 'supertest'
import mongoose from 'mongoose'
import app from '../app.js'
import User from '../models/user.js'
import dotenv from 'dotenv'

dotenv.config()

// Increase timeout for all hooks and tests
jest.setTimeout(15000)

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/url_shortener_test_db'
  await mongoose.connect(mongoUri)
}, 10000)

afterAll(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase()
  }
  await mongoose.disconnect()
}, 10000)

beforeEach(async () => {
  await User.deleteMany({})
})

describe('Auth API', () => {
  it('should return 200 for the root path', async () => {
    const res = await request(app).get('/')
    expect(res.statusCode).toEqual(200)
    expect(res.text).toContain('URL Shortener API is running smoothly!')
  })

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'password123'
      })
    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty('token')
    expect(res.body.user.username).toEqual('testuser')
  })

  it('should not register a user with existing username', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'existinguser',
        password: 'password237'
      })

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'existinguser',
        password: 'password123'
      })
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toMatch(/user.*exists/i)
  })

  it('should log in an existing user successfully', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'loginuser',
        password: 'loginpassword237'
      })

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'loginuser',
        password: 'loginpassword237'
      })
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body.user.username).toEqual('loginuser')
  })

  it('should not log in with invalid password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'invalidpassuser',
        password: 'validpassword237'
      })

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'invalidpassuser',
        password: 'wrongpassword237'
      })
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toMatch(/invalid.*credentials|password/i)
  })
})