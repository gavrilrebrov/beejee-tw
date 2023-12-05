const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = {
  login: async (req, res) => {
    if (
      !req.body.username ||
      !req.body.password
    ) {
      res.status(400)
      res.send('Логин и пароль обязательны')
      return
    }

    const admin = await prisma.admin.findFirst({
      where: {
        username: req.body.username
      }
    })

    if (!admin) {
      res.status(400)
      res.send('Неправильный логин или пароль')
      return
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      admin.password
    )

    if (!validPassword) {
      res.status(400)
      res.send('Неправильный логин или пароль')
      return
    }

    const token = jwt.sign({
      adminId: admin.id,
    }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    })

    res.send({
      token,
      admin: {
        ...admin,
        password: undefined,
      }
    })
  },

  me: async (req, res) => {
    const admin = req.payload.admin

    if (!admin) {
      res.status(401)
      res.send('Не авторизован')
      return
    }

    res.send({
      me: admin,
    })
  }
}