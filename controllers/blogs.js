const blogRouter = require('express').Router()
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response) => {

  const blogs = await Blog.find({})
  response.json(blogs)
})


blogRouter.get('/:id', async (request, response) => {

  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  response.json(blog)
})


blogRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  // try {
  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
  // }  catch(exception) {
  //   next(exception)
  // }
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

blogRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

module.exports = blogRouter