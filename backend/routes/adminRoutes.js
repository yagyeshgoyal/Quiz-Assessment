const router = require('express').Router()
const { adminLogin, getProfessors, createProfessor, deleteProfessor } = require('../controllers/adminController')
const { adminAuth } = require('../middleware/auth')

router.post('/login', adminLogin)
router.get('/professors', adminAuth, getProfessors)
router.post('/professors', adminAuth, createProfessor)
router.delete('/professors/:id', adminAuth, deleteProfessor)

module.exports = router