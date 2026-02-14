const Section = require('../models/Section')
const Subject = require('../models/Subject')
const Result = require('../models/Result')
const StudentAttempt = require('../models/StudentAttempt')

// GET /api/test/subjects  — public, for student login dropdowns
const getPublicSubjectsAndSections = async (req, res, next) => {
  try {
    const subjects = await Subject.distinct('name')
    const sectionsRaw = await Section.distinct('name')
    res.json({ subjects, sections: sectionsRaw })
  } catch (err) { next(err) }
}

// POST /api/test/start
const startTest = async (req, res, next) => {
  try {
    const { rollNo, sectionName, subjectName } = req.body
    if (!rollNo?.trim() || !sectionName || !subjectName) {
      return res.status(400).json({ message: 'Roll number, section, and subject are required.' })
    }

    // Find the subject by name
    const subject = await Subject.findOne({ name: subjectName })
    if (!subject) return res.status(404).json({ message: 'Subject not found.' })

    // Find the section that belongs to this subject
    const section = await Section.findOne({ name: sectionName, subject: subject._id })
    if (!section) return res.status(404).json({ message: 'Section not found for this subject.' })

    if (!section.questions || section.questions.length === 0) {
      return res.status(400).json({ message: 'No questions available for this test yet.' })
    }

    // Check if already attempted
    const existing = await StudentAttempt.findOne({
      rollNo: rollNo.trim(),
      section: section._id,
      subject: subject._id,
    })
    if (existing) {
      return res.status(403).json({ message: 'You have already submitted this test. Multiple attempts are not allowed.' })
    }

    // Return questions WITHOUT correct answers (strip correct field)
    const safeQuestions = section.questions.map(({ _id, text, options }) => ({ _id, text, options }))

    res.json({
      sectionId: section._id,
      subjectId: subject._id,
      timeLimit: section.testConfig?.timeLimit || 30,
      questions: safeQuestions,
      testConfig: section.testConfig,
    })
  } catch (err) { next(err) }
}

// POST /api/test/submit
const submitTest = async (req, res, next) => {
  try {
    const { rollNo, sectionName, subjectName, sectionId, answers } = req.body
    if (!rollNo || !sectionId || !answers) {
      return res.status(400).json({ message: 'Missing required fields.' })
    }

    // Double-check attempt restriction
    const subject = await Subject.findOne({ name: subjectName })
    const section = await Section.findById(sectionId).populate('subject')

    if (!section) return res.status(404).json({ message: 'Section not found.' })

    const existingAttempt = await StudentAttempt.findOne({
      rollNo: rollNo.trim(),
      section: section._id,
      subject: subject?._id || section.subject,
    })
    if (existingAttempt) {
      return res.status(403).json({ message: 'Test already submitted.' })
    }

    // Grade answers
    const answersMap = {}
    answers.forEach(({ questionId, selectedOption }) => {
      answersMap[questionId.toString()] = selectedOption
    })

    let score = 0
    const gradedAnswers = section.questions.map((q) => {
      const selected = answersMap[q._id.toString()] ?? -1
      const isCorrect = selected === q.correct
      if (isCorrect) score++
      return { questionId: q._id, selectedOption: selected, isCorrect }
    })

    const total = section.questions.length

    // Save result
    const result = await Result.create({
      rollNo: rollNo.trim(),
      section: section._id,
      subject: subject?._id || section.subject,
      professor: section.professor,
      score,
      total,
      answers: gradedAnswers,
    })

    // Record attempt to prevent re-taking
    await StudentAttempt.create({
      rollNo: rollNo.trim(),
      section: section._id,
      subject: subject?._id || section.subject,
    })

    res.json({ score, total, percentage: total > 0 ? Math.round((score / total) * 100) : 0 })
  } catch (err) { next(err) }
}

module.exports = { getPublicSubjectsAndSections, startTest, submitTest }