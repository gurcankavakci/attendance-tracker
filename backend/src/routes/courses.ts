import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/', async (_req, res) => {
  const courses = await prisma.course.findMany({ orderBy: { createdAt: 'asc' } })
  res.json(courses)
})

router.post('/', async (req, res) => {
  const { name, code, requiredPercent, color } = req.body as {
    name: string
    code: string
    requiredPercent: number
    color: string
  }
  const course = await prisma.course.create({
    data: { name, code: code ?? '', requiredPercent, color },
  })
  res.status(201).json(course)
})

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const data = req.body as Partial<{ name: string; code: string; requiredPercent: number; color: string }>
  const course = await prisma.course.update({ where: { id }, data })
  res.json(course)
})

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  await prisma.course.delete({ where: { id } })
  res.status(204).end()
})

export default router
