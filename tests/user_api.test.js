const bcrypt = require('bcrypt')
const { test, after, beforeEach, describe } = require('node:test')
const assert = require('assert')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially one user in db', () => {

  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ name: 'Mauricio Jourdan', username: 'root', password: passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('Creation fails with appropriate status code and message if password is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Mauri',
      name: 'Mauricio Jourdan',
      password: 'mj',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('Password must be at least 3 characters long'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('Creation fails with appropriate status code and message if name is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Mauri',
      name: 'Ma',
      password: 'mauri',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const text = `User validation failed: name: Path \`name\` (\`${newUser.name}\`) is shorter than the minimum allowed length (3).`
    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes(text))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('Creation fails if name is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Mauri',
      // name: 'Mauricio Jourdan',
      password: 'maujour',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('User validation failed: name: Path `name` is required.'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('Creation fails if username is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      // username: 'Mauri',
      name: 'Mauricio Jourdan',
      password: 'maujour',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes('User validation failed: username: Path `username` is required.'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

})

after(async () => {
  await mongoose.connection.close()
})
