import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import ProfessorList from '../components/ProfessorList'
import Modal from '../components/Modal'
import { Plus, Lock } from 'lucide-react'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { adminToken, professors, fetchProfessors, addProfessor, deleteProfessor, loading } = useStore()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', password: '' })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!adminToken) { navigate('/admin/login'); return }
    fetchProfessors()
  }, [adminToken])

  const filtered = professors.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.name.trim()) { setFormError('Name is required.'); return }
    if (!form.password.trim() || form.password.length < 6) { setFormError('Password must be at least 6 characters.'); return }
    const ok = await addProfessor(form.name.trim(), form.password)
    if (ok) { setForm({ name: '', password: '' }); setModal(false) }
  }

  return (
    <div className="page min-h-screen">
      <div className="noise-overlay" />
      <Header title="Admin Dashboard" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">Professors</h1>
            <p className="text-muted text-sm">{professors.length} professor{professors.length !== 1 ? 's' : ''} registered</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal(true)}>
            <Plus size={15} /> Add Professor
          </button>
        </div>

        <div className="mb-5">
          <SearchBar value={search} onChange={setSearch} placeholder="Search professors..." />
        </div>

        <ProfessorList
          professors={filtered}
          onSelect={(prof) => navigate(`/professor/login?id=${prof._id}&name=${encodeURIComponent(prof.name)}`)}
          onDelete={deleteProfessor}
        />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Professor">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="form-label">Professor Name</label>
            <input
              className="form-input"
              placeholder="Dr. Jane Smith"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                className="form-input pl-9"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>
          </div>
          {formError && <p className="text-danger text-sm">{formError}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Plus size={14} /> {loading ? 'Adding...' : 'Add Professor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}