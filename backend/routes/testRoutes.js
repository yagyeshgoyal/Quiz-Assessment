const router = require('express').Router()
const { getPublicSubjectsAndSections, startTest, submitTest } = require('../controllers/testController')

router.get('/subjects', getPublicSubjectsAndSections)
router.post('/start', startTest)
router.post('/submit', submitTest)

module.exports = router