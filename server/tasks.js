const jwt = require('jsonwebtoken')

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = {
  list: async (req, res) => {
    const records = await prisma.task.findMany({
      take: req.query.limit ? +req.query.limit : undefined,
      skip: req.query.page && req.query.limit ? (+req.query.limit * +req.query.page) - +req.query.limit : undefined,
      orderBy: req.query.orderBy && req.query.order ? {
        [req.query.orderBy]: req.query.order,
      } : {
        createdAt: 'desc'
      },
    })

    const count = await prisma.task.count()

    let pageCount = 0

    if (req.query.limit && req.query.page) {
      pageCount = Math.ceil(count / +req.query.limit)
    }

    res.send({
      records,
      count,
      pageCount,
    })
  },

  create: async (req, res) => {
    const record = await prisma.task.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        text: req.body.text,
      }
    })

    res.send(record)
  },

  updateStatus: async (req, res, next) => {
    const admin = req.payload.admin

    if (!admin) {
      res.status(401)
      res.send('Не авторизован')
      return
    }

    const record = await prisma.task.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        isDone: req.body.isDone,
      }
    })

    res.send(record)
  },

  update: async (req, res, next) => {
    const admin = req.payload.admin

    if (!admin) {
      res.status(401)
      res.send('Не авторизован')
      return
    }

    let record = await prisma.task.findUnique({
      where: {
        id: Number(req.params.id),
      }
    })

    record = await prisma.task.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        text: req.body.text,
        isDone: req.body.isDone,
        isEdited: !record.isEdited ? req.body.text !== record.text : undefined,
      }
    })

    res.send(record)
  }
}