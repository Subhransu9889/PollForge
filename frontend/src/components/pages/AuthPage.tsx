import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { LoginFormData, RegisterFormData } from '@/utils/validation'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Card, CardContent } from '@/components/ui/card'
import { TypographyH1, TypographyP, TypographySmall } from '@/components/ui/typography'
import { BarChart3, CheckCircle2, Clock3, ShieldCheck, Sparkles, UsersRound } from 'lucide-react'

interface AuthPageProps {
  mode: 'login' | 'register'
  onSubmit: (data: LoginFormData | RegisterFormData) => Promise<void>
}

export function AuthPage({ mode, onSubmit }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (data: LoginFormData | RegisterFormData) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-shell auth-shell">
      <main className="auth-layout">
        <section className="auth-story">
          <Link to="/" className="brand-lockup">
            <div className="brand-mark">
              <BarChart3 className="size-6" />
            </div>
            <span>PollForge</span>
          </Link>

          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/7 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              Live feedback workspace
            </div>
            <TypographyH1 className="max-w-xl">
              {mode === 'login' ? 'Welcome back to your polling cockpit.' : 'Create a workspace for decisions that move.'}
            </TypographyH1>
            <TypographyP className="max-w-lg text-base">
              Build focused questions, share a polished public link, and turn responses into readable decisions.
            </TypographyP>
          </div>

          <div className="auth-preview" aria-hidden="true">
            <div className="auth-preview-header">
              <div>
                <TypographySmall>Launch readiness poll</TypographySmall>
                <strong>What needs one more pass?</strong>
              </div>
              <span className="live-pill">Live</span>
            </div>
            <div className="preview-bars">
              <div>
                <span>Pricing clarity</span>
                <i style={{ width: '68%' }} />
              </div>
              <div>
                <span>Onboarding flow</span>
                <i style={{ width: '53%' }} />
              </div>
              <div>
                <span>Results page</span>
                <i style={{ width: '76%' }} />
              </div>
            </div>
            <div className="auth-metrics">
              <span><UsersRound className="size-4" /> 128 responses</span>
              <span><Clock3 className="size-4" /> 2h left</span>
              <span><ShieldCheck className="size-4" /> Verified</span>
            </div>
          </div>

          <div className="auth-benefits">
            <span><CheckCircle2 className="size-4" /> Anonymous or signed-in responses</span>
            <span><CheckCircle2 className="size-4" /> Realtime charts</span>
            <span><CheckCircle2 className="size-4" /> Public result publishing</span>
          </div>
        </section>

        <section className="auth-panel-wrap">
          <div className="mb-6 lg:hidden">
            <Link to="/" className="brand-lockup">
              <div className="brand-mark">
                <BarChart3 className="size-5" />
              </div>
              <span>PollForge</span>
            </Link>
          </div>
          <Card className="auth-card">
            <CardContent className="p-6 sm:p-7">
              {mode === 'login' ? (
                <LoginForm
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  onSwitchToRegister={() => navigate('/signup')}
                />
              ) : (
                <RegisterForm
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  onSwitchToLogin={() => navigate('/signin')}
                />
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
