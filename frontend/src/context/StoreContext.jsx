import { createContext, useContext, useState, useCallback } from 'react'
import api from '../services/api'

export const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  // ── Auth State ───────────────────────────────────────────
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || null)
  const [professorToken, setProfessorToken] = useState(localStorage.getItem('professorToken') || null)
  const [currentProfessor, setCurrentProfessor] = useState(
    JSON.parse(localStorage.getItem('currentProfessor') || 'null')
  )

  // ── UI State ─────────────────────────────────────────────
  const [notification, setNotification] = useState(null)
  const [loading, setLoading] = useState(false)

  // ── Student Test State ───────────────────────────────────
  const [student, setStudent] = useState({ rollNo: '', section: '', subject: '' })
  const [testState, setTestState] = useState({
    questions: [],
    answers: {},
    currentIndex: 0,
    timeLeft: 0,
    started: false,
    sectionId: null,
    subjectId: null,
    date: null,          
    startTime: null,     
    endTime: null 
  })

  // ── Data State ───────────────────────────────────────────
  const [professors, setProfessors] = useState([])
  const [subjects, setSubjects] = useState([])
  const [sections, setSections] = useState([])
  const [results, setResults] = useState([])

  // ── Helpers ──────────────────────────────────────────────
  const notify = useCallback((msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3500)
  }, [])

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5)

  // ── Auth Actions ─────────────────────────────────────────
  const adminLogin = async (password) => {
    try {
      setLoading(true)
      const { data } = await api.post('/admin/login', { password })
      setAdminToken(data.token)
      localStorage.setItem('adminToken', data.token)
      notify('Welcome, Admin!')
      return true
    } catch (err) {
      notify(err.response?.data?.message || 'Invalid password', 'error')
      return false
    } finally {
      setLoading(false)
    }
  }

  const adminLogout = () => {
    setAdminToken(null)
    localStorage.removeItem('adminToken')
    setProfessors([])
  }

  const professorLogin = async (professorId, password) => {
    try {
      setLoading(true)
      const { data } = await api.post('/professors/login', { professorId, password })
      setProfessorToken(data.token)
      setCurrentProfessor(data.professor)
      localStorage.setItem('professorToken', data.token)
      localStorage.setItem('currentProfessor', JSON.stringify(data.professor))
      notify(`Welcome, ${data.professor.name}!`)
      return true
    } catch (err) {
      notify(err.response?.data?.message || 'Invalid credentials', 'error')
      return false
    } finally {
      setLoading(false)
    }
  }

  const professorLogout = () => {
    setProfessorToken(null)
    setCurrentProfessor(null)
    localStorage.removeItem('professorToken')
    localStorage.removeItem('currentProfessor')
    setSubjects([])
    setSections([])
  }

  // ── Professor CRUD ───────────────────────────────────────
  const fetchProfessors = async () => {
    try {
      const { data } = await api.get('/admin/professors', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      setProfessors(data)
    } catch (err) {
      notify('Failed to fetch professors', 'error')
    }
  }

  const addProfessor = async (name, password) => {
    try {
      const { data } = await api.post(
        '/admin/professors',
        { name, password },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      setProfessors((prev) => [...prev, data])
      notify(`Professor "${name}" added.`)
      return true
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to add professor', 'error')
      return false
    }
  }

  const deleteProfessor = async (id) => {
    try {
      await api.delete(`/admin/professors/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      setProfessors((prev) => prev.filter((p) => p._id !== id))
      notify('Professor deleted.')
    } catch (err) {
      notify('Failed to delete professor', 'error')
    }
  }

  // ── Subject CRUD ─────────────────────────────────────────
  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/professors/subjects', {
        headers: { Authorization: `Bearer ${professorToken}` },
      })
      setSubjects(data)
    } catch (err) {
      notify('Failed to fetch subjects', 'error')
    }
  }

  const addSubject = async (name) => {
    try {
      const { data } = await api.post(
        '/professors/subjects',
        { name },
        { headers: { Authorization: `Bearer ${professorToken}` } }
      )
      setSubjects((prev) => [...prev, data])
      notify(`Subject "${name}" added.`)
      return data
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to add subject', 'error')
      return null
    }
  }

  const deleteSubject = async (id) => {
    try {
      await api.delete(`/professors/subjects/${id}`, {
        headers: { Authorization: `Bearer ${professorToken}` },
      })
      setSubjects((prev) => prev.filter((s) => s._id !== id))
      notify('Subject deleted.')
    } catch (err) {
      notify('Failed to delete subject', 'error')
    }
  }

  // ── Section CRUD ─────────────────────────────────────────
  const fetchSections = async (subjectId) => {
    try {
      const { data } = await api.get(`/professors/subjects/${subjectId}/sections`, {
        headers: { Authorization: `Bearer ${professorToken}` },
      })
      setSections(data)
    } catch (err) {
      notify('Failed to fetch sections', 'error')
    }
  }

  const addSection = async (subjectId, name) => {
    try {
      const { data } = await api.post(
        `/professors/subjects/${subjectId}/sections`,
        { name },
        { headers: { Authorization: `Bearer ${professorToken}` } }
      )
      setSections((prev) => [...prev, data])
      notify(`Section "${name}" added.`)
      return data
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to add section', 'error')
      return null
    }
  }

  const deleteSection = async (sectionId) => {
    try {
      await api.delete(`/professors/sections/${sectionId}`, {
        headers: { Authorization: `Bearer ${professorToken}` },
      })
      setSections((prev) => prev.filter((s) => s._id !== sectionId))
      notify('Section deleted.')
    } catch (err) {
      notify('Failed to delete section', 'error')
    }
  }

  const updateTestConfig = async (sectionId, config) => {
    try {
      const { data } = await api.put(
        `/professors/sections/${sectionId}/config`,
        config,
        { headers: { Authorization: `Bearer ${professorToken}` } }
      )
      setSections((prev) => prev.map((s) => (s._id === sectionId ? data : s)))
      notify('Test config saved.')
    } catch (err) {
      notify('Failed to update config', 'error')
    }
  }

  // ── Question CRUD ────────────────────────────────────────
  const addQuestion = async (sectionId, questionData) => {
    try {
      const { data } = await api.post(
        `/professors/sections/${sectionId}/questions`,
        questionData,
        { headers: { Authorization: `Bearer ${professorToken}` } }
      )
      setSections((prev) =>
        prev.map((s) =>
          s._id === sectionId ? { ...s, questions: [...(s.questions || []), data] } : s
        )
      )
      notify('Question added.')
      return data
    } catch (err) {
      notify('Failed to add question', 'error')
      return null
    }
  }

  const deleteQuestion = async (sectionId, questionId) => {
    try {
      await api.delete(`/professors/sections/${sectionId}/questions/${questionId}`, {
        headers: { Authorization: `Bearer ${professorToken}` },
      })
      setSections((prev) =>
        prev.map((s) =>
          s._id === sectionId
            ? { ...s, questions: s.questions.filter((q) => q._id !== questionId) }
            : s
        )
      )
      notify('Question deleted.')
    } catch (err) {
      notify('Failed to delete question', 'error')
    }
  }

  // ── Test (Student) Actions ───────────────────────────────
  const startTest = async (rollNo, sectionName, subjectName) => {
    try {
      setLoading(true)
      const { data } = await api.post('/test/start', { rollNo, sectionName, subjectName })
      
      const shuffledQs = shuffleArray(data.questions).map((q) => ({
        ...q,
        shuffledOptions: shuffleArray(
          q.options.map((text, origIndex) => ({ text, origIndex }))
        ),
      }))
      setStudent({ rollNo, section: sectionName, subject: subjectName })
      setTestState({
        questions: shuffledQs,
        answers: {},
        currentIndex: 0,
        timeLeft: data.timeLimit * 60,
        started: true,
        sectionId: data.sectionId,
        subjectId: data.subjectId,
        date: data.testConfig.date || null,         
        startTime: data.testConfig.startTime || null,     
        endTime: data.testConfig.endTime|| null 
      })
      return true
    } catch (err) {
      notify(err.response?.data?.message || 'Cannot start test', 'error')
      return false
    } finally {
      setLoading(false)
    }
  }

  const selectAnswer = (questionId, optionIndex) => {
    setTestState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: optionIndex },
    }))
  }

  const navigateQuestion = (direction) => {
    setTestState((prev) => ({
      ...prev,
      currentIndex: Math.max(0, Math.min(prev.questions.length - 1, prev.currentIndex + direction)),
    }))
  }

  const goToQuestion = (index) => {
    setTestState((prev) => ({ ...prev, currentIndex: index }))
  }

  const tickTimer = () => {
    setTestState((prev) => ({ ...prev, timeLeft: Math.max(0, prev.timeLeft - 1) }))
  }

  const submitTest = async () => {
    try {
      setLoading(true)
      const { rollNo, section, subject } = student
      const { answers, sectionId, questions } = testState
      const formattedAnswers = questions.map((q) => ({
        questionId: q._id,
        selectedOption: answers[q._id] ?? -1,
      }))
      const { data } = await api.post('/test/submit', {
        rollNo, sectionName: section, subjectName: subject, sectionId, answers: formattedAnswers,
      })
      // Clear test state immediately
      setTestState({ questions: [], answers: {}, currentIndex: 0, timeLeft: 0, started: false, sectionId: null, subjectId: null })
      setStudent({ rollNo: '', section: '', subject: '' })
      notify(`Test submitted! Score: ${data.score}/${data.total}`)
      return data
    } catch (err) {
      notify(err.response?.data?.message || 'Submission failed', 'error')
      return null
    } finally {
      setLoading(false)
    }
  }

  // ── Results ──────────────────────────────────────────────
  const fetchResults = async (sectionId) => {
    try {
      const { data } = await api.get(`/results/section/${sectionId}`, {
        headers: { Authorization: `Bearer ${professorToken}` },
      })
      setResults(data)
    } catch (err) {
      notify('Failed to fetch results', 'error')
    }
  }

  // ── Subjects list for student login ─────────────────────
  const fetchPublicSubjects = async () => {
    try {
      const { data } = await api.get('/test/subjects')
      return data
    } catch {
      return []
    }
  }

  return (
    <StoreContext.Provider
      value={{
        // auth
        adminToken, professorToken, currentProfessor,
        adminLogin, adminLogout, professorLogin, professorLogout,
        // ui
        notification, loading,
        notify,
        // student
        student, testState,
        startTest, selectAnswer, navigateQuestion, goToQuestion, tickTimer, submitTest,
        // professors
        professors, fetchProfessors, addProfessor, deleteProfessor,
        // subjects
        subjects, fetchSubjects, addSubject, deleteSubject,
        // sections
        sections, fetchSections, addSection, deleteSection, updateTestConfig,
        // questions
        addQuestion, deleteQuestion,
        // results
        results, fetchResults,
        // public
        fetchPublicSubjects,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}