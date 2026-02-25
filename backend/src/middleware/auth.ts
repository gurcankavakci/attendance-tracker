import { Request, Response, NextFunction } from 'express'
import { generateToken } from '../routes/auth'

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Yetkisiz erişim' })
    return
  }
  const token = authHeader.slice(7)
  if (token !== generateToken()) {
    res.status(401).json({ error: 'Geçersiz token' })
    return
  }
  next()
}
