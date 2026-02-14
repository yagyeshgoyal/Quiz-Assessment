import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import Header from '../components/Header'
import { Shield, Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { adminLogin, loading } = useStore()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const ok = await adminLogin(password)
    if (ok) navigate('/admin/dashboard')
    else setError('Invalid admin password.')
  }

  return (
    <div className="page min-h-screen">
      <div className="noise-overlay" />
      <Header onBack={() => navigate('/')} />
      <div className="flex items-center justify-center min-h-[calc(100vh-65px)] px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-yellow-950/30 border border-accent/30 flex items-center justify-center mx-auto mb-4">
              <Shield size={24} className="text-accent" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-1.5">Admin Access</h1>
            <p className="text-muted text-sm">Enter the admin password to continue</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    autoFocus
                  />
                </div>
              </div>
              {error && <p className="text-danger text-sm">{error}</p>}
              <button
                type="submit"
                className="btn btn-primary w-full justify-center"
                disabled={loading}
              >
                <Shield size={14} />
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}