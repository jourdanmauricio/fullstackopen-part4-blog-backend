const config = require('./utils/config')
const logger = require('./utils/logger')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const morgan = require('morgan')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = config.MONGODB_URI
// info('connecting to', url)

mongoose.connect(url)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch(error => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())
morgan.token('body', (req) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    return JSON.stringify(req.body)
  }
  return '-'
})

// app.use(morgan('tiny'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// app.use(middleware.tokenExtractor)
// app.use(middleware.userExtractor)

app.use('/api/login', loginRouter)
// app.use('/api/blogs', middleware.userExtractor, blogsRouter)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app


