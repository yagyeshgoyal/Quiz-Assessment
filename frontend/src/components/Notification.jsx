import { useStore } from '../context/StoreContext'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function Notification() {
  const { notification } = useStore()
  if (!notification) return null
  const isError = notification.type === 'error'
  return (
    <div
      className={`fixed top-20 right-6 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium animate-slideInRight backdrop-blur-sm
        ${isError
          ? 'bg-red-950/40 border border-danger/40 text-danger'
          : 'bg-emerald-950/40 border border-success/40 text-success'}`}
    >
      {isError ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
      {notification.msg}
    </div>
  )
}