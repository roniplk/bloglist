const logger = require('./logger')

const reqLogger = (req, res, next) => {
	const { method, path, body } = req
	if (JSON.stringify(body) === "{}")
		logger.info(`${method} ${path}`)
	else
		logger.info(`${method} ${path} \n${JSON.stringify(body, null, 4)}`)
	next()
}
const errorHandler = (err, req, res, next) => {
	logger.error(err.message)

	if (err.name === 'CastError')
		return res.status(400).send({ error: "malformatted id" })
	if (err.name === "JsonWebTokenError")
		return res.status(401).send({ error: err.message })
	if (err.name === "ValidationError")
		return res.status(400).send({ error: err.message })
	if (err.name === "TokenExpiredError")
		return res.status(400).send({ error: "token expired" })

	next(err)
}

module.exports = {
	reqLogger,
	errorHandler
}