const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
	const users = await User.find({})
		.populate("blogs", {
			user: 0
		})
	response.json(users)
})

usersRouter.post('/', async (request, response) => {
	// check uniqueness
	const found = await User.findOne({ username: request.body.username })
	if (found !== null)
		response.status(400).send({ error: "username should be unique" })

	const { username, name, password } = request.body
	const saltRounds = 10
	const passwordHash = await bcrypt.hash(password, saltRounds)

	const user = new User({
		username,
		name,
		passwordHash,
	})
	const savedUser = await user.save()
	response.status(201).json(savedUser)
})
usersRouter.delete('/:id', async (request, response) => {
	const id = request.params.id

	const found = await User.findByIdAndDelete(id)
	if (found === null)
		response.status(404).end()
	else
		response.status(204).end()
})

module.exports = usersRouter