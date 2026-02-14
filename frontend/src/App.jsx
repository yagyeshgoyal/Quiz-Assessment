import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './context/StoreContext'
import Notification from './components/Notification'

import HomePage from './pages/HomePage'
import TestPage from './pages/TestPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboard from './pages/AdminDashboard'
import ProfessorLoginPage from './pages/ProfessorLoginPage'
import ProfessorPage from './pages/ProfessorPage'
import SubjectPage from './pages/SubjectPage'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Notification />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/professor/login" element={<ProfessorLoginPage />} />
          <Route path="/professor" element={<ProfessorPage />} />
          <Route path="/professor/subject/:subjectId" element={<SubjectPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}