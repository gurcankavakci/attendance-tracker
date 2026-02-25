import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/', async (_req, res) => {
  const settings = await prisma.semesterSettings.findUnique({ where: { id: 1 } })
  res.json(settings ?? null)
})

router.put('/', async (req, res) => {
  const { startWeek, startYear, endWeek, endYear } = req.body as {
    startWeek: number
    startYear: number
    endWeek: number
    endYear: number
  }
  const settings = await prisma.semesterSettings.upsert({
    where: { id: 1 },
    update: { startWeek, startYear, endWeek, endYear },
    create: { id: 1, startWeek, startYear, endWeek, endYear },
  })
  res.json(settings)
})

router.delete('/', async (_req, res) => {
  await prisma.semesterSettings.deleteMany({ where: { id: 1 } })
  res.status(204).end()
})

export default router
