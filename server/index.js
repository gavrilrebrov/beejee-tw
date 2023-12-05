const express = require('express')
const { PrismaClient } = require('@prisma/client')
const tasks = require('./tasks')
const auth = require('./auth')
const guard = require('./guard')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()
const app = express()
const router = express.Router({ mergeParams: true })
const viewRouter = express.Router()

const createAdmin = async (req, res, next) => {
  const admin = await prisma.admin.findFirst({
    where: {
      username: 'admin'
    }
  })

  if (!admin) {
    await prisma.admin.create({
      data: {
        username: 'admin',
        password: bcrypt.hashSync('123', 12),
      }
    })

    console.log('Администратор создан')
  }

  next()
}

app.use(createAdmin)
app.use(express.static('build'))

router.get('/tasks', tasks.list)
router.post('/tasks', tasks.create)
router.post('/tasks/:id', guard, tasks.update)
router.post('/tasks/:id/status', guard, tasks.updateStatus)

router.post('/auth', auth.login)
router.get('/auth', guard, auth.me)

app.use(express.json())
app.use('/api', router)
app.use('/', viewRouter)

app.listen(5000, () => {
  console.log('server started...')
})