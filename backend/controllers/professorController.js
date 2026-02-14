const jwt = require('jsonwebtoken')
const Professor = require('../models/Professor')
const Subject = require('../models/Subject')
const Section = require('../models/Section')
const Result = require('../models/Result')
const StudentAttempt = require('../models/StudentAttempt')

// POST /api/professors/login
const professorLogin = async (req, res, next) => {
  try {
    const { professorId, password } = req.body
    if (!professorId || !password) return res.status(400).json({ message: 'ID and password required.' })
    const professor = await Professor.findById(professorId).select('+password')
    if (!professor) return res.status(401).json({ message: 'Professor not found.' })
    const match = await professor.comparePassword(password)
    if (!match) return res.status(401).json({ message: 'Invalid password.' })
    const token = jwt.sign(
      { role: 'professor', professorId: professor._id, name: professor.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )
    res.json({ token, professor: { _id: professor._id, name: professor.name } })
  } catch (err) { next(err) }
}

// GET /api/professors/subjects
const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ professor: req.professor.professorId }).lean()
    const enriched = await Promise.all(
      subjects.map(async (s) => {
        const sections = await Section.find({ subject: s._id }).lean()
        const sectionCount = sections.length
        const questionCount = sections.reduce((a, sec) => a + (sec.questions?.length || 0), 0)
        const resultCount = await Result.countDocuments({ subject: s._id })
        return { ...s, sectionCount, questionCount, resultCount }
      })
    )
    res.json(enriched)
  } catch (err) { next(err) }
}

// POST /api/professors/subjects
const createSubject = async (req, res, next) => {
  try {
    const { name } = req.body
    if (!name?.trim()) return res.status(400).json({ message: 'Subject name required.' })
    const subject = await Subject.create({ name: name.trim(), professor: req.professor.professorId })
    res.status(201).json({ ...subject.toObject(), sectionCount: 0, questionCount: 0, resultCount: 0 })
  } catch (err) { next(err) }
}

// DELETE /api/professors/subjects/:id
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, professor: req.professor.professorId })
    if (!subject) return res.status(404).json({ message: 'Subject not found.' })
    const sections = await Section.find({ subject: subject._id })
    const sectionIds = sections.map((s) => s._id)
    await Result.deleteMany({ section: { $in: sectionIds } })
    await StudentAttempt.deleteMany({ section: { $in: sectionIds } })
    await Section.deleteMany({ subject: subject._id })
    await Subject.findByIdAndDelete(subject._id)
    res.json({ message: 'Subject deleted.' })
  } catch (err) { next(err) }
}

// GET /api/professors/subjects/:subjectId/sections
const getSections = async (req, res, next) => {
  try {
    const sections = await Section.find({
      subject: req.params.subjectId,
      professor: req.professor.professorId,
    }).lean()
    res.json(sections)
  } catch (err) { next(err) }
}

// POST /api/professors/subjects/:subjectId/sections
const createSection = async (req, res, next) => {
  try {
    const { name } = req.body
    if (!name?.trim()) return res.status(400).json({ message: 'Section name required.' })
    const section = await Section.create({
      name: name.trim(),
      subject: req.params.subjectId,
      professor: req.professor.professorId,
      testConfig: { date: '', startTime: '', endTime: '', timeLimit: 30 },
      questions: [],
    })
    res.status(201).json(section)
  } catch (err) { next(err) }
}

// DELETE /api/professors/sections/:sectionId
const deleteSection = async (req, res, next) => {
  try {
    const section = await Section.findOne({ _id: req.params.sectionId, professor: req.professor.professorId })
    if (!section) return res.status(404).json({ message: 'Section not found.' })
    await Result.deleteMany({ section: section._id })
    await StudentAttempt.deleteMany({ section: section._id })
    await Section.findByIdAndDelete(section._id)
    res.json({ message: 'Section deleted.' })
  } catch (err) { next(err) }
}

// PUT /api/professors/sections/:sectionId/config
const updateTestConfig = async (req, res, next) => {
  try {
    const { date, startTime, endTime, timeLimit } = req.body
    const section = await Section.findOneAndUpdate(
      { _id: req.params.sectionId, professor: req.professor.professorId },
      { testConfig: { date, startTime, endTime, timeLimit } },
      { new: true }
    )
    if (!section) return res.status(404).json({ message: 'Section not found.' })
    res.json(section)
  } catch (err) { next(err) }
}

// POST /api/professors/sections/:sectionId/questions
const addQuestion = async (req, res, next) => {
  try {
    const { text, options, correct } = req.body
    if (!text?.trim() || !options || options.length !== 4 || options.some((o) => !o?.trim())) {
      return res.status(400).json({ message: 'Question text and 4 non-empty options required.' })
    }
    if (correct < 0 || correct > 3) return res.status(400).json({ message: 'Correct must be 0-3.' })
    const section = await Section.findOneAndUpdate(
      { _id: req.params.sectionId, professor: req.professor.professorId },
      { $push: { questions: { text: text.trim(), options, correct } } },
      { new: true }
    )
    if (!section) return res.status(404).json({ message: 'Section not found.' })
    const newQ = section.questions[section.questions.length - 1]
    res.status(201).json(newQ)
  } catch (err) { next(err) }
}

// DELETE /api/professors/sections/:sectionId/questions/:questionId
const deleteQuestion = async (req, res, next) => {
  try {
    const section = await Section.findOneAndUpdate(
      { _id: req.params.sectionId, professor: req.professor.professorId },
      { $pull: { questions: { _id: req.params.questionId } } },
      { new: true }
    )
    if (!section) return res.status(404).json({ message: 'Section not found.' })
    res.json({ message: 'Question deleted.' })
  } catch (err) { next(err) }
}

module.exports = {
  professorLogin, getSubjects, createSubject, deleteSubject,
  getSections, createSection, deleteSection, updateTestConfig,
  addQuestion, deleteQuestion,
}