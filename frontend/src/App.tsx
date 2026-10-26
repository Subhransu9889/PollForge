import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
const Dashboard = lazy(() => import('@/components/pages/Dashboard').then(module => ({ default: module.Dashboard })))
const PublicPoll = lazy(() => import('@/components/pages/PublicPoll').then(module => ({ default: module.PublicPoll })))
import { LandingPage } from '@/components/pages/LandingPage'
import { AuthPage } from '@/components/pages/AuthPage'
import { useApi } from '@/hooks/useApi'
import type { LoginFormData, RegisterFormData } from '@/utils/validation'

export default function App() {
  return (
    <>
      <Suspense fallback={<div className="app-shell grid place-items-center" role="status"><p className="text-muted">Loading your workspace…</p></div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<AuthRoute mode="login" />} />
        <Route path="/signup" element={<AuthRoute mode="register" />} />
        <Route path="/dashboard" element={<ProtectedDashboard />} />
        <Route path="/p/:pollId" element={<PublicPollRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
      <Toaster
        position="bottom-right"
        theme="dark"
        richColors
        toastOptions={{
          style: {
            background: '#0c1824',
            color: '#eef6ff',
            border: '1px solid rgba(255, 255, 255, 0.14)',
          },
        }}
      />
    </>
  )
}

function ProtectedDashboard() {
  const { token, user } = useAuth()
  if (!token || !user) {
    return <Navigate to="/signin" replace />
  }

  return <Dashboard />
}

function PublicPollRoute() {
  const { pollId } = useParams()
  if (!pollId) {
    return <Navigate to="/" replace />
  }

  return <PublicPoll pollId={pollId} />
}

function AuthRoute({ mode }: { mode: 'login' | 'register' }) {
  const { token, user, setToken, setUser } = useAuth()
  const { api } = useApi()
  const navigate = useNavigate()

  if (token && user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleAuth = async (data: LoginFormData | RegisterFormData) => {
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const response = await api(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      setToken(response.token)
      setUser(response.user)
      toast.success(mode === 'login' ? 'Signed in successfully!' : 'Account created!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      toast.error(message)
      throw err
    }
  }

  return <AuthPage mode={mode} onSubmit={handleAuth} />
}
