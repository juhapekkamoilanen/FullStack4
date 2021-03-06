const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('blogs')
  
  return response.json(users)
})

usersRouter.post('/', async (request, response) => {
  try {
    const body = request.body

    if (body.password.length < 3) {
      return response.status(403).json({ error: 'password too short' })
    }

    const isUnique = (await User.find({ username: body.username })).length === 0

    if (!isUnique) {
      return response.status(403).json({ error: 'duplicate username!'})
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      adult: body.adult === undefined ? true : body.adult,
      passwordHash: passwordHash
    })

    const savedUser = await user.save()

    return response.json(savedUser)
  } catch (exception) {
    console.log(exception)
    return response.status(500).json({ error: 'something went wrong...' })
  }
})

module.exports = usersRouter