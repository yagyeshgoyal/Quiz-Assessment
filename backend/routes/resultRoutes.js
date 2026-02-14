const router = require('express').Router()
const { getSectionResults } = require('../controllers/resultController')
const { professorAuth } = require('../middleware/auth')

router.get('/section/:sectionId', professorAuth, getSectionResults)

module.exports = router