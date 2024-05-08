const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')


describe("Blogs - initially 2 blogs in DB", () => {
	beforeEach(async () => {
		// initialize
		await Blog.deleteMany({})
		for (let blog of helper.initialBlogs) {
			let blogObj = new Blog(blog)
			await blogObj.save()
		}
	})
	test("GET /blogs returns blogs are as json", async () => {
		await api
			.get("/api/blogs")
			.expect(200)
			.expect("Content-Type", /application\/json/)
	})
	test("GET /blogs returns correct number of blogs", async () => {
		const res = await api.get("/api/blogs")
		expect(res.body).toHaveLength(helper.initialBlogs.length)
	})
	// TODO: test authenticating
	test.skip("POST /blogs creates a blog entry", async () => {
		const users = await helper.usersInDb()
		const newBlog = {
			title: "Go To Statement Considered Harmful",
			author: "Mary Doe",
			url: "asdf.com",
			likes: 5,
			userId: users[0].id
		}

		await api
			.post('/api/blogs')
			.send(newBlog)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const blogsAtEnd = await helper.blogsInDb()
		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
		const authors = blogsAtEnd.map(b => b.author)
		expect(authors).toContain("Mary Doe")
	})
	test("DELETE /blogs/:id deletes a blog entry", async () => {
		const blogsAtStart = await helper.blogsInDb()
		const blogToDelete = blogsAtStart[0]
		await api
			.delete(`/api/blogs/${blogToDelete.id}`)
			.expect(204)
		const blogsAtEnd = await helper.blogsInDb()
		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
		const ids = blogsAtEnd.map(b => b.id)
		expect(ids).not.toContain(blogToDelete.id)
	})
})

describe("Users - initially 1 user in DB", () => {
	beforeEach(async () => {
		// initialize with root user
		await User.deleteMany({})
		const passwordHash = await bcrypt.hash('asdf123', 10)
		const user = new User({ username: 'root', passwordHash, name: "A Name" })
		await user.save()
	})
	test("GET /users returns correct number of users", async () => {
		const res = await api.get("/api/users")
		expect(res.body).toHaveLength(1)
	})
	test("POST /users creates user when username is unique", async () => {
		const usersAtStart = await helper.usersInDb()
		const newUser = {
			username: "uusi123",
			name: "Real Name",
			password: "cats123",
		}
		await api
			.post('/api/users')
			.send(newUser)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
		const usernames = usersAtEnd.map(u => u.username)
		expect(usernames).toContain(newUser.username)
	})
	test("POST /users does not create user when username taken", async () => {
		const usersAtStart = await helper.usersInDb()
		const newUser = {
			username: "root",
			name: "Superuser",
			password: "salainen2",
		}
		const result = await api
			.post("/api/users")
			.send(newUser)
			.expect(400)
			.expect("Content-Type", /application\/json/)
	
		expect(result.body.error).toContain("username should be unique")
		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toEqual(usersAtStart)
	})
})

afterAll(async () => {
	await mongoose.connection.close()
})
