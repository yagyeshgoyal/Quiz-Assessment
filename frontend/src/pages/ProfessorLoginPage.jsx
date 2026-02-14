import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import Header from '../components/Header'
import { Users, Lock } from 'lucide-react'

export default function ProfessorLoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { professors, fetchProfessors, professorLogin, loading } = useStore()
  const [profId, setProfId] = useState(searchParams.get('id') || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Load professors list for the dropdown
    fetchProfessors()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!profId) { setError('Please select a professor.'); return }
    const ok = await professorLogin(profId, password)
    if (ok) navigate('/professor')
    else setError('Invalid credentials.')
  }

  return (
    <div className="page min-h-screen">
      <div className="noise-overlay" />
      <Header onBack={() => navigate('/')} />
      <div className="flex items-center justify-center min-h-[calc(100vh-65px)] px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-950/30 border border-accent2/30 flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-accent2" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-1.5">Professor Login</h1>
            <p className="text-muted text-sm">Access your subjects and test management</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Select Professor</label>
                <select
                  className="form-input appearance-none"
                  value={profId}
                  onChange={(e) => setProfId(e.target.value)}
                >
                  <option value="">Select...</option>
                  {professors.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="password"
                    className="form-input pl-9"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              {error && <p className="text-danger text-sm">{error}</p>}
              <button type="submit" className="btn btn-blue w-full justify-center" disabled={loading}>
                <Users size={14} />
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}