import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import Header from '../components/Header'
import { ChevronRight } from 'lucide-react'

export default function HomePage() {
  const navigate = useNavigate()
  const { startTest, fetchPublicSubjects, loading } = useStore()
  const [rollNo, setRollNo] = useState('')
  const [section, setSection] = useState('')
  const [subject, setSubject] = useState('')
  const [error, setError] = useState('')
  const [subjectOptions, setSubjectOptions] = useState([])
  const [sectionOptions, setSectionOptions] = useState([])

  useEffect(() => {
    fetchPublicSubjects().then((data) => {
      setSubjectOptions(data.subjects || [])
      setSectionOptions(data.sections || [])
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!rollNo.trim()) { setError('Please enter your Roll Number.'); return }
    if (!section) { setError('Please select your Section.'); return }
    if (!subject) { setError('Please select your Subject.'); return }
    const ok = await startTest(rollNo.trim(), section, subject)
    if (ok) navigate('/test')
    else setError('Unable to start test. Please check your details.')
  }

  return (
    <div className="page min-h-screen">
      <div className="noise-overlay" />
      <Header />

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-20 pb-14"
        style={{ background: 'radial-gradient(ellipse at 20% 40%, rgba(232,177,79,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 60%, rgba(79,158,232,0.05) 0%, transparent 60%)' }}>
        <p className="text-xs font-semibold tracking-[0.15em] uppercase text-accent mb-4">Assessment Portal</p>
        <h1 className="font-display text-5xl font-bold leading-tight mb-4">
          Quiz <span className="text-accent">Assessment</span><br />System
        </h1>
        <p className="text-muted max-w-md mx-auto text-base leading-relaxed mb-10">
          Enter your credentials to access your assigned test.
        </p>
      </section>

      {/* Form */}
      <div className="relative z-10 max-w-md mx-auto px-6 pb-20">
        <div className="card">
          <div className="mb-6">
            <h2 className="font-display text-lg font-semibold">Student Login</h2>
            <p className="text-muted text-xs mt-1">Fill in your details to begin</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Roll Number</label>
              <input
                className="form-input"
                placeholder="e.g. CS001"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Section</label>
              <select
                className="form-input appearance-none"
                value={section}
                onChange={(e) => setSection(e.target.value)}
              >
                <option value="">Select Section</option>
                {sectionOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Subject</label>
              <select
                className="form-input appearance-none"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <option value="">Select Subject</option>
                {subjectOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {error && <p className="text-danger text-sm">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full justify-center mt-2"
              disabled={loading}
            >
              {loading ? 'Loading...' : <>Begin Test <ChevronRight size={16} /></>}
            </button>
          </form>
        </div>

        
      </div>
    </div>
  )
}