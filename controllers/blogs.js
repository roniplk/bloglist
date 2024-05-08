const logger = require('../utils/logger')
const Blog = require('../models/blog')
const User = require('../models/user')
const bloglistRouter = require('express').Router()
const jwt = require('jsonwebtoken')
require('dotenv').config()

const getTokenFrom = request => {
	const auth = request.get("authorization")
	if (auth && auth.startsWith("Bearer "))
		return auth.replace("Bearer ", "")
	else
		return null
}

bloglistRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({})
		.populate("user", {
			blogs: 0
		})
	response.json(blogs)
})
bloglistRouter.get('/:id', async (request, response) => {
	const id = request.params.id
	const blog = await Blog.findById(id)
		.populate("user", {
			blogs: 0
		})
	response.json(blog)
})
bloglistRouter.post('/', async (request, response) => {
	const body = request.body
	// authentication
	const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
	if (!decodedToken.id)
	  return response.status(401).json({ error: "invalid token" })

	const user = await User.findById(decodedToken.id)
	const newBlog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes ? body.likes : 0,
		user: user._id
	})
	const savedBlog = await newBlog.save()
	user.blogs = user.blogs.concat(savedBlog._id)
	await user.save()
	response.status(201).json(savedBlog) 
})
bloglistRouter.delete('/:id', async (request, response) => {
	const blogId = request.params.id
	const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
	if (!decodedToken.id)
	  return response.status(401).json({ error: "invalid token" })
	const blogOwner = (await Blog.findById(blogId)).user.toString()
	console.log(`Owner: ${blogOwner}, Request sender: ${decodedToken.id}`)

	if (decodedToken.id !== blogOwner)
		return response.status(403).json({ error: "no rights to delete this entry" })
	const found = await Blog.findByIdAndDelete(blogId)
	if (found === null)
		response.status(404).end()
	else
		response.status(204).end()
})
bloglistRouter.put('/:id', async (request, response) => {
	const id = request.params.id

	const user = await User.findById(request.body.user)
	const found = await Blog.findByIdAndUpdate(id, {
		...request.body, user: user._id
	})
	if (found === null)
		response.status(404).end()
	else
		response.status(201).end()
})

module.exports = bloglistRouter