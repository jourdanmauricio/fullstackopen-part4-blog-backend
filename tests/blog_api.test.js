const assert = require('node:assert/strict')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

describe('when there is initially some blogs saved', () => {

  beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.initialBlogs
      .map(blog => new Blog(blog))

    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)

  // for (let blog of helper.initialBlogs) {
  //   let blogObject = new Blog(blog)
  //   await blogObject.save()
  // }
  })

  test.only('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('There are blogs by the author Mauricio Jourdan', async () => {
    const response = await api.get('/api/blogs')

    const authors = response.body.map(e => e.author)
    // assert.strictEqual(authors.includes('Mauricio Jourdan'), true)
    assert(authors.includes('Mauricio Jourdan'))
  })

  describe('viewing a specific blog', () => {

    test('succeeds with a valid id', async () => {
      const blogsAtStart = await helper.blogsInDb()

      const blogToView = blogsAtStart[0]

      const resultblog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.deepStrictEqual(resultblog.body, blogToView)
    })

    test('fails with statuscode 404 if blog does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()

      await api
        .get(`/api/blogs/${validNonexistingId}`)
        .expect(404)
    })

    test('fails with statuscode 400 id is invalid', async () => {
      const invalidId = '64b47c3e9870ad1f90b82aa'

      await api
        .get(`/api/blogs/${invalidId}`)
        .expect(400)
    })
  })

  describe('addition of a new blog', () => {

    test('a valid blog can be added ', async () => {
      const newBlog =   {
        title: 'React Tips & Tricks',
        author: 'Laura Martínez',
        url: 'https://lauram.dev/react-tips',
        likes: 78,
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)


      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
      const titles = blogsAtEnd.map(n => n.title)

      assert(titles.includes('React Tips & Tricks'))
    })

    test('The returned blogs have a defined id field', async () => {
      // const response = await api.get('/api/blogs')
      const blogs = await helper.blogsInDb()

      blogs.forEach(blog => {
        assert.ok(blog.id, 'The blog does not have the "id" field defined')
      })
    })

    test('blog without title is not added', async () => {

      const newBlog = {
        author: 'Laura Martínez',
        // title: 'Full Stack con NestJS',
        url: 'https://lauram.dev/react-tips2',
        likes: 85,
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  describe('addition of a new blog', () => {

    test('the blog cannot be modified', async () => {
      const validNonexistingId = await helper.nonExistingId()

      const blog = {
        likes: 80
      }

      await api
        .put(`/api/blogs/${validNonexistingId}`)
        .send(blog)
        .expect(404)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('the blog can be updated', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const blog = {
        likes: 80
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(blog)
        .expect(200)

      const blogsAtEnd = await helper.blogsInDb()

      const blogUpdLikes = blogsAtEnd[0].likes

      assert.strictEqual(blogUpdLikes, blog.likes)
    })

  })

  describe('deleting a blog', () => {

    test('the blog can be deleted', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      const titles = blogsAtEnd.map(r => r.title)
      assert(!titles.includes(blogToDelete.title))

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
