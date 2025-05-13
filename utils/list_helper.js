const { info } = require('../utils/logger')

const dummy = (blogs) => {
  info('blogs', blogs)
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {

  if (blogs.length === 0) return null

  const mostLiked = blogs.reduce((max, blog) => {
    return blog.likes > max.likes ? blog : max
  })

  return {
    title: mostLiked.title,
    author: mostLiked.author,
    likes: mostLiked.likes,
  }

}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}

