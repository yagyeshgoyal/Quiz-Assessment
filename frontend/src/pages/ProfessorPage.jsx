import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import Modal from '../components/Modal'
import { Plus, BookOpen, Layers, BarChart2, Trash2 } from 'lucide-react'

export default function ProfessorPage() {
  const navigate = useNavigate()
  const { professorToken, currentProfessor, subjects, fetchSubjects, addSubject, deleteSubject, loading } = useStore()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [subjectName, setSubjectName] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!professorToken) { navigate('/professor/login'); return }
    fetchSubjects()
  }, [professorToken])

  const filtered = subjects.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))

  const handleAdd = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!subjectName.trim()) { setFormError('Subject name is required.'); return }
    const created = await addSubject(subjectName.trim())
    if (created) { setSubjectName(''); setModal(false) }
  }

  const openSubject = (sub) => {
    navigate(`/professor/subject/${sub._id}`)
  }

  return (
    <div className="page min-h-screen">
      <div className="noise-overlay" />
      <Header title={currentProfessor?.name} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">{currentProfessor?.name}</h1>
            <p className="text-muted text-sm">{subjects.length} subject{subjects.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal(true)}>
            <Plus size={15} /> Add Subject
          </button>
        </div>

        <div className="mb-6">
          <SearchBar value={search} onChange={setSearch} placeholder="Search subjects..." />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <div className="text-5xl mb-4 opacity-30">📚</div>
            <p className="text-sm">No subjects yet. Add your first subject.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((sub) => (
              <div
                key={sub._id}
                className="card cursor-pointer hover:border-accent/30 group"
                onClick={() => openSubject(sub)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-950/30 border border-accent/20 flex items-center justify-center">
                    <BookOpen size={18} className="text-accent" />
                  </div>
                  <button
                    className="btn btn-danger btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); deleteSubject(sub._id) }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <h3 className="font-display font-semibold mb-1">{sub.name}</h3>
                <p className="text-xs text-muted mb-4">
                  {sub.sectionCount || 0} sections · {sub.questionCount || 0} questions
                </p>
                <div className="flex gap-2">
                  <span className="badge badge-blue"><Layers size={10} /> {sub.sectionCount || 0}</span>
                  <span className="badge badge-green"><BarChart2 size={10} /> {sub.resultCount || 0} results</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Subject">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="form-label">Subject Name</label>
            <input
              className="form-input"
              placeholder="e.g. Data Structures"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              autoFocus
            />
          </div>
          {formError && <p className="text-danger text-sm">{formError}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Plus size={14} /> Add Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}