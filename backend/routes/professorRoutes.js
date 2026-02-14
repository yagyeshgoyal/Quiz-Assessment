const router = require('express').Router()
const {
  professorLogin,
  getSubjects, createSubject, deleteSubject,
  getSections, createSection, deleteSection, updateTestConfig,
  addQuestion, deleteQuestion,
} = require('../controllers/professorController')
const { professorAuth } = require('../middleware/auth')

router.post('/login', professorLogin)

// Subjects
router.get('/subjects', professorAuth, getSubjects)
router.post('/subjects', professorAuth, createSubject)
router.delete('/subjects/:id', professorAuth, deleteSubject)

// Sections
router.get('/subjects/:subjectId/sections', professorAuth, getSections)
router.post('/subjects/:subjectId/sections', professorAuth, createSection)
router.delete('/sections/:sectionId', professorAuth, deleteSection)
router.put('/sections/:sectionId/config', professorAuth, updateTestConfig)

// Questions (embedded in Section)
router.post('/sections/:sectionId/questions', professorAuth, addQuestion)
router.delete('/sections/:sectionId/questions/:questionId', professorAuth, deleteQuestion)

module.exports = router