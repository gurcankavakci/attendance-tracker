import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/', async (_req, res) => {
  const slots = await prisma.scheduleSlot.findMany()
  res.json(slots)
})

router.post('/', async (req, res) => {
  const { courseId, dayOfWeek, startTime, endTime, location } = req.body as {
    courseId: number
    dayOfWeek: number
    startTime: string
    endTime: string
    location: string
  }
  const slot = await prisma.scheduleSlot.create({
    data: { courseId, dayOfWeek, startTime, endTime, location: location ?? '' },
  })
  res.status(201).json(slot)
})

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  await prisma.scheduleSlot.delete({ where: { id } })
  res.status(204).end()
})

export default router
