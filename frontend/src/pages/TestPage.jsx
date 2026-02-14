import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import Header from '../components/Header'
import Timer from '../components/Timer'
import QuestionCard from '../components/QuestionCard'
import NavigationButtons from '../components/NavigationButtons'

export default function TestPage() {
  const navigate = useNavigate()
  const { testState, student, submitTest, goToQuestion } = useStore()
  const { questions, answers, currentIndex, started } = testState
  const submittingRef = useRef(false)

  // Redirect if no active test
  useEffect(() => {
    if (!started || questions.length === 0) navigate('/')
  }, [started])

  // Anti-cheating: disable right-click, copy-paste, keyboard shortcuts
  useEffect(() => {
    const stopContextMenu = (e) => e.preventDefault()
    const stopCopy = (e) => e.preventDefault()
    const stopCut = (e) => e.preventDefault()
    const stopPaste = (e) => e.preventDefault()
    const stopKeys = (e) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault()
      if (['F12', 'F11', 'F10', 'F5'].includes(e.key)) e.preventDefault()
    }
    document.addEventListener('contextmenu', stopContextMenu)
    document.addEventListener('copy', stopCopy)
    document.addEventListener('cut', stopCut)
    document.addEventListener('paste', stopPaste)
    document.addEventListener('keydown', stopKeys)
    return () => {
      document.removeEventListener('contextmenu', stopContextMenu)
      document.removeEventListener('copy', stopCopy)
      document.removeEventListener('cut', stopCut)
      document.removeEventListener('paste', stopPaste)
      document.removeEventListener('keydown', stopKeys)
    }
  }, [])

  const handleSubmit = async () => {
    if (submittingRef.current) return
    submittingRef.current = true
    await submitTest()
    navigate('/')
  }

  const handleTimerExpire = () => {
    if (!submittingRef.current) handleSubmit()
  }

  if (!started || questions.length === 0) return null

  const answered = Object.keys(answers).length
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="select-none-all min-h-screen page">
      <Header
        title={`${student.subject} · ${student.section}`}
        rightContent={
          <div className="flex items-center gap-3">
            <span className="badge badge-blue font-mono">{student.rollNo}</span>
            <Timer onExpire={handleTimerExpire} />
          </div>
        }
      />

      <div className="max-w-3xl mx-auto px-6 py-9">
        {/* Progress bar */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted">Question {currentIndex + 1} of {questions.length}</span>
          <span className="text-xs text-muted">{answered} / {questions.length} answered</span>
        </div>
        <div className="h-1 bg-border rounded-full mb-7 overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question number dots */}
        <div className="flex flex-wrap gap-1.5 mb-7">
          {questions.map((q, i) => {
            const isActive = i === currentIndex
            const isDone = answers[q._id] !== undefined
            return (
              <button
                key={i}
                onClick={() => goToQuestion(i)}
                className={`w-8 h-8 rounded-md text-xs font-semibold font-mono transition-all duration-150 border
                  ${isActive
                    ? 'bg-accent text-bg border-accent'
                    : isDone
                    ? 'bg-emerald-950/40 text-success border-success/40'
                    : 'bg-surface text-muted border-border hover:border-muted'}`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>

        {/* Question */}
        <QuestionCard />

        {/* Navigation */}
        <NavigationButtons onSubmit={handleSubmit} />
      </div>
    </div>
  )
}