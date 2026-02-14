const jwt = require('jsonwebtoken')
const StudentAttempt = require('../models/StudentAttempt')

// ── Admin Auth Middleware ─────────────────────────────────
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' })
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied.' })
    req.admin = decoded
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' })
  }
}

// ── Professor Auth Middleware ─────────────────────────────
const professorAuth = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' })
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'professor') return res.status(403).json({ message: 'Access denied.' })
    req.professor = decoded
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' })
  }
}

// ── Attempt Restriction Middleware ───────────────────────
const attemptRestriction = async (req, res, next) => {
  try {
    const { rollNo, sectionId, subjectId } = req.body
    if (!rollNo || !sectionId || !subjectId) return next()
    const existing = await StudentAttempt.findOne({ rollNo, section: sectionId, subject: subjectId })
    if (existing) {
      return res.status(403).json({ message: 'You have already submitted this test. Multiple attempts are not allowed.' })
    }
    next()
  } catch (err) {
    next(err)
  }
}

// ── Error Handler Middleware ──────────────────────────────
const errorHandler = (err, req, res, next) => {
  console.error('❌', err.stack || err.message)
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({ message, stack: err.stack })
  }
  res.status(statusCode).json({ message })
}

module.exports = { adminAuth, professorAuth, attemptRestriction, errorHandler }