import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  const { week, year } = req.query as { week?: string; year?: string }

  if (week && year) {
    const records = await prisma.attendanceRecord.findMany({
      where: { week: Number(week), year: Number(year) },
    })
    res.json(records)
    return
  }

  const records = await prisma.attendanceRecord.findMany()
  res.json(records)
})

router.put('/', async (req, res) => {
  const { scheduleSlotId, courseId, date, week, year, status } = req.body as {
    scheduleSlotId: number
    courseId: number
    date: string
    week: number
    year: number
    status: string
  }

  const record = await prisma.attendanceRecord.upsert({
    where: { scheduleSlotId_date: { scheduleSlotId, date } },
    update: { status },
    create: { scheduleSlotId, courseId, date, week, year, status },
  })
  res.json(record)
})

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  await prisma.attendanceRecord.delete({ where: { id } })
  res.status(204).end()
})

export default router
