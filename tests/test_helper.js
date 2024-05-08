const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
	{
		title: 'Test blog',
		author: "John Doe",
		url: "blog1.com",
		likes: 3,
		user: "661fce6be17c80ef41a4e220"
	},
	{
		title: 'Second blog',
		author: "Mike Doe",
		url: "2ndblog.net",
		likes: 6,
		user: "661fce6be17c80ef41a4e220"
	}
]

const nonExistingId = async () => {
	const blog = new Blog({
		title: 'aasdf',
		author: "asdf",
		url: "abc.fi",
		likes: 0
	})
	await blog.save()
	await blog.deleteOne()
	return blog._id.toString()
}

const blogsInDb = async () => {
	const blogs = await Blog.find({})
	return blogs.map(b => b.toJSON())
}

const usersInDb = async () => {
	const users = await User.find({})
	return users.map(u => u.toJSON())
}

module.exports = {
	initialBlogs,
	nonExistingId,
	blogsInDb,
	usersInDb
}