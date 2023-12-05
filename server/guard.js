const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = async function (req, res, next) {
  const { authorization } = req.headers

  if (authorization) {
    const token = authorization.split(' ')[1]

    if (token === 'undefined') {
      res.status(401)
      res.send('Не авторизован')
      return
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET)

    const admin = await prisma.admin.findUnique({
      where: {
        id: payload.adminId
      }
    })

    if (!admin) {
      res.status(401)
      res.send('Не авторизован')
      return
    }

    req.payload = {
      ...payload,
      admin: {
        ...admin,
        password: undefined,
      },
    }
  }

  next()
}