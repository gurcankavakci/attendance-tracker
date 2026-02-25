import { Router } from 'express'
import { createHmac } from 'crypto'

const router = Router()

export function generateToken(): string {
  const password = process.env.APP_PASSWORD ?? ''
  const secret = process.env.TOKEN_SECRET ?? 'default-secret'
  return createHmac('sha256', secret).update(password).digest('hex')
}

router.post('/login', (req, res) => {
  const { password } = req.body as { password?: string }
  if (!password || password !== process.env.APP_PASSWORD) {
    res.status(401).json({ error: 'Şifre yanlış' })
    return
  }
  res.json({ token: generateToken() })
})

export default router
