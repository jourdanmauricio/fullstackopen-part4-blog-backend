const _ = require('lodash')
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

const mostBlogs = (blogs) => {

  if (blogs.length === 0) return null

  const groupedByAuthor = _.countBy(blogs, 'author')

  console.log('groupedByAuthor', groupedByAuthor)

  const [author, numberOfBlogs] = _.maxBy(Object.entries(groupedByAuthor), ([, count]) => count)

  return { author, blogs: numberOfBlogs }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  const groupedByAuthor = _.groupBy(blogs, 'author')

  const likesByAuthor = _.map(groupedByAuthor, (authorBlogs, author) => ({
    author,
    likes: _.sumBy(authorBlogs, 'likes'),
  }))

  return _.maxBy(likesByAuthor, 'likes')
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}

