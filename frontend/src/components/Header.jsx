import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { Shield, LogOut, ArrowLeft } from 'lucide-react'

export default function Header({ title, onBack, rightContent }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { adminToken, adminLogout, professorToken, professorLogout, currentProfessor } = useStore()

  const isHomePage = location.pathname === '/'

  const handleLogout = () => {
    if (adminToken) {
      adminLogout()
      navigate('/admin/login')
    } else if (professorToken) {
      professorLogout()
      navigate('/')
    }
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-border backdrop-blur-xl bg-surface/90">
      <div
        className="flex items-center gap-2.5 font-display text-xl font-bold text-accent cursor-pointer"
        onClick={() => navigate('/')}
      >
        <span className="w-2 h-2 rounded-full bg-accent inline-block" />
        QuizAssess
      </div>

      {title && <span className="text-muted text-sm hidden md:block">{title}</span>}

      <div className="flex items-center gap-2">
        {onBack && (
          <button className="btn btn-ghost btn-sm" onClick={onBack}>
            <ArrowLeft size={14} /> Back
          </button>
        )}

        {rightContent}

        {(adminToken || professorToken) ? (
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            <LogOut size={14} />
            {adminToken
              ? 'Admin Logout'
              : `Logout (${currentProfessor?.name?.split(' ')[0]})`}
          </button>
        ) : (
          isHomePage && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/admin/login')}
            >
              <Shield size={14} /> Admin
            </button>
          )
        )}
      </div>
    </header>
  )
}
