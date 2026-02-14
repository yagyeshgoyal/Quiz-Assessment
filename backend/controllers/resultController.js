
const Result = require('../models/Result')
const Section = require('../models/Section')

// GET /api/results/section/:sectionId
const getSectionResults = async (req, res, next) => {
  try {
    const { sectionId } = req.params

    // Verify section belongs to this professor
    const section = await Section.findOne({ _id: sectionId, professor: req.professor.professorId })
    if (!section) return res.status(404).json({ message: 'Section not found.' })

    const results = await Result.find({ section: sectionId })
      .limit(200)
      .sort({ createdAt: -1 })
      .lean()

    res.json(results)
  } catch (err) { next(err) }
}

module.exports = { getSectionResults }