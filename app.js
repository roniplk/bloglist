const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const midware = require('./utils/middleware')

require('express-async-errors')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl)
logger.info(`Connected to ${mongoUrl}`)

app.use(cors())
app.use(express.json())
app.use(midware.reqLogger)
app.use(express.static("dist"))
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use(midware.errorHandler)

module.exports = app