const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogRouter.get('/', async (request, response) => {

  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })
  response.json(blogs)
})

blogRouter.get('/:id', async (request, response) => {

  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  response.json(blog)
})

blogRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body

  const user = request.user

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user.id
  })
  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    likes: body.likes,
  }

  const updBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })

  if (!updBlog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  response.json(updBlog)
})

blogRouter.delete('/:id', middleware.userExtractor, async (request, response) => {

  const user = request.user
  const blog = await Blog.findById(request.params.id)

  if (!blog) return response.status(404).json({ error: 'blog not found' })
  if (!blog.user) return response.status(403).json({ error: 'you do not have permission to delete this blog' })

  if (blog && blog.user.equals(user._id)) {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } else {
    response.status(403).json({ error: 'you do not have permission to delete this blog' })
  }
})

module.exports = blogRouter