const assert = require('node:assert/strict')
const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  const noteObjects = helper.initialBlogs
    .map(blog => new Blog(blog))

  const promiseArray = noteObjects.map(blog => blog.save())
  await Promise.all(promiseArray)

  // for (let blog of helper.initialBlogs) {
  //   let noteObject = new Blog(blog)
  //   await noteObject.save()
  // }
})

test.only('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two blogs', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, 2)
})

test('There are blogs by the author Mauricio Jourdan', async () => {
  const response = await api.get('/api/blogs')

  const authors = response.body.map(e => e.author)
  // assert.strictEqual(authors.includes('Mauricio Jourdan'), true)
  assert(authors.includes('Mauricio Jourdan'))
})

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

  // const response = await api.get('/api/blogs')
  // const titles = response.body.map(r => r.title)
  // assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)

  assert(titles.includes('React Tips & Tricks'))
})

test('The returned blogs have a defined id field', async () => {
  // const response = await api.get('/api/blogs')
  const blogs = await helper.blogsInDb()

  blogs.forEach(blog => {
    assert.ok(blog.id, 'The blog does not have the "id" field defined')
  })
})

test('a valid blog can be added ', async () => {
  const newBlog = {
    author: 'Laura Martínez',
    title: 'Full Stack con NestJS',
    url: 'https://lauram.dev/react-tips2',
    likes: 85,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(n => n.title)
  assert(titles.includes('Full Stack con NestJS'))
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

  // const response = await api.get('/api/blogs')
  // assert.strictEqual(response.body.length, helper.initialBlogs.length)
  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

after(async () => {
  await mongoose.connection.close()
})

