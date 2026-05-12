import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { Dashboard } from '@/components/pages/Dashboard'
import { PublicPoll } from '@/components/pages/PublicPoll'
import { LandingPage } from '@/components/pages/LandingPage'
import { AuthPage } from '@/components/pages/AuthPage'
import { useApi } from '@/hooks/useApi'
import type { LoginFormData, RegisterFormData } from '@/utils/validation'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<AuthRoute mode="login" />} />
        <Route path="/signup" element={<AuthRoute mode="register" />} />
        <Route path="/dashboard" element={<ProtectedDashboard />} />
        <Route path="/p/:pollId" element={<PublicPollRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="bottom-right" />
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
