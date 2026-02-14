const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Professor = require('../models/Professor')
const Subject = require('../models/Subject')
const Section = require('../models/Section')
const Result = require('../models/Result')
const StudentAttempt = require('../models/StudentAttempt')

// POST /api/admin/login
const adminLogin = async (req, res, next) => {
  try {
    const { password } = req.body
    if (!password) return res.status(400).json({ message: 'Password required.' })

    const adminPassword = process.env.ADMIN_PASSWORD
    const isMatch =  password === adminPassword

    if (!isMatch) return res.status(401).json({ message: 'Invalid admin password.' })
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' })
    res.json({ token })
  } catch (err) { next(err) }
}

// GET /api/admin/professors
const getProfessors = async (req, res, next) => {
  try {
    const professors = await Professor.find().lean()
    // Attach counts
    const enriched = await Promise.all(
      professors.map(async (p) => {
        const subjectCount = await Subject.countDocuments({ professor: p._id })
        return { ...p, subjectCount }
      })
    )
    res.json(enriched)
  } catch (err) { next(err) }
}

// POST /api/admin/professors
const createProfessor = async (req, res, next) => {
  try {
    const { name, password } = req.body
    if (!name?.trim() || !password) return res.status(400).json({ message: 'Name and password required.' })
    const existing = await Professor.findOne({ name: name.trim() })
    if (existing) return res.status(409).json({ message: 'Professor with this name already exists.' })
    const professor = await Professor.create({ name: name.trim(), password })
    const { password: _, ...safe } = professor.toObject()
    res.status(201).json({ ...safe, subjectCount: 0 })
  } catch (err) { next(err) }
}

// DELETE /api/admin/professors/:id  — cascade delete
const deleteProfessor = async (req, res, next) => {
  try {
    const { id } = req.params
    const professor = await Professor.findById(id)
    if (!professor) return res.status(404).json({ message: 'Professor not found.' })

    // Cascade: subjects → sections → questions (embedded) → results → attempts
    const subjects = await Subject.find({ professor: id })
    const subjectIds = subjects.map((s) => s._id)
    const sections = await Section.find({ subject: { $in: subjectIds } })
    const sectionIds = sections.map((s) => s._id)

    await Result.deleteMany({ section: { $in: sectionIds } })
    await StudentAttempt.deleteMany({ section: { $in: sectionIds } })
    await Section.deleteMany({ subject: { $in: subjectIds } })
    await Subject.deleteMany({ professor: id })
    await Professor.findByIdAndDelete(id)

    res.json({ message: 'Professor and all related data deleted.' })
  } catch (err) { next(err) }
}

module.exports = { adminLogin, getProfessors, createProfessor, deleteProfessor }