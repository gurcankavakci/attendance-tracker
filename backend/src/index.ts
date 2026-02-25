import express from 'express'
import cors from 'cors'
import { requireAuth } from './middleware/auth'
import authRouter from './routes/auth'
import coursesRouter from './routes/courses'
import scheduleRouter from './routes/schedule'
import attendanceRouter from './routes/attendance'
import semesterRouter from './routes/semester'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

// Public
app.use('/api/auth', authRouter)

// Protected
app.use('/api/courses', requireAuth, coursesRouter)
app.use('/api/schedule-slots', requireAuth, scheduleRouter)
app.use('/api/attendance', requireAuth, attendanceRouter)
app.use('/api/semester', requireAuth, semesterRouter)

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})
