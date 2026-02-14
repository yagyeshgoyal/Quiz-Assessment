require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const rateLimit = require('express-rate-limit')

const adminRoutes = require('./routes/adminRoutes')
const professorRoutes = require('./routes/professorRoutes')
const testRoutes = require('./routes/testRoutes')
const resultRoutes = require('./routes/resultRoutes')
const errorHandler = require('./middleware/errorHandler')

const app = express()

// ── Middleware ────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'))

// ── Rate Limiting ─────────────────────────────────────────
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests.' })
const authLimiter   = rateLimit({ windowMs: 15 * 60 * 1000, max: 20,  message: 'Too many login attempts.' })
app.use('/api', globalLimiter)
app.use('/api/admin/login', authLimiter)
app.use('/api/professors/login', authLimiter)

// ── Routes ────────────────────────────────────────────────
app.use('/api/admin', adminRoutes)
app.use('/api/professors', professorRoutes)
app.use('/api/test', testRoutes)
app.use('/api/results', resultRoutes)

// ── Health Check ──────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// ── Error Handler ─────────────────────────────────────────
app.use(errorHandler)

// ── Database + Server ─────────────────────────────────────
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(PORT, () => console.log(`Server running on ${PORT}`))
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  })

module.exports = app