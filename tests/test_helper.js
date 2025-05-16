const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'My Blog',
    author: 'Mauricio Jourdan',
    url: 'https://mauricio.jourdan.com.ar',
    likes: 25,
  },
  {
    title: 'Tech Trends 2025',
    author: 'Lucía González',
    url: 'https://luciagonzalez.dev/tech-trends',
    likes: 40,
  }
]

const nonExistingId = async () => {

  const blog = new Blog(  {
    title: 'Next.js Performance Guide',
    author: 'Carlos Vega',
    url: 'https://carlosvega.dev/nextjs-performance',
    likes: 102,
  },)

  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
}



