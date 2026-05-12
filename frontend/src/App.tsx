import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import './App.css'

type User = { id: string; firstName?: string; lastName?: string; email: string; name?: string }
type Option = { id?: string; label: string }
type Question = { id?: string; text: string; required: boolean; options: Option[] }
type Poll = {
  id: string
  title: string
  description: string
  responseMode: 'anonymous' | 'authenticated'
  expiresAt: string
  isExpired: boolean
  isPublished: boolean
  totalResponses?: number
  questions: Question[]
}
type Analytics = {
  totalResponses: number
  participation: { authenticatedResponses: number; anonymousResponses: number; completionRate: number }
  questions: Array<{
    id: string
    text: string
    answered: number
    skipped: number
    options: Array<{ id: string; label: string; count: number; percent: number }>
  }>
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
const blankQuestion = (): Question => ({
  text: '',
  required: true,
  options: [{ label: '' }, { label: '' }],
})

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('pollforge_token') ?? '')
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pollforge_user')
    return saved ? JSON.parse(saved) : null
  })
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authForm, setAuthForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [polls, setPolls] = useState<Poll[]>([])
  const [selectedPollId, setSelectedPollId] = useState('')
  const [selectedAnalytics, setSelectedAnalytics] = useState<Analytics | null>(null)
  const [publicPoll, setPublicPoll] = useState<Poll | null>(null)
  const [publicAnalytics, setPublicAnalytics] = useState<Analytics | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [builder, setBuilder] = useState({
    title: '',
    description: '',
    responseMode: 'anonymous' as 'anonymous' | 'authenticated',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    questions: [blankQuestion()],
  })

  const publicPollId = useMemo(() => {
    const match = window.location.pathname.match(/^\/p\/([^/]+)/)
    return match?.[1] ?? ''
  }, [])

  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

  async function api(path: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message ?? 'Request failed')
    }
    return data
  }

  async function loadMine() {
    if (!token || publicPollId) return
    const data = await api('/api/polls/mine')
    setPolls(data.polls)
    if (!selectedPollId && data.polls[0]) setSelectedPollId(data.polls[0].id)
  }

  async function loadAnalytics(id: string) {
    if (!id || !token) return
    const data = await api(`/api/polls/${id}/analytics`)
    setSelectedAnalytics(data.analytics)
  }

  async function loadPublicPoll() {
    if (!publicPollId) return
    const data = await api(`/api/polls/${publicPollId}`)
    setPublicPoll(data.poll)
    setPublicAnalytics(data.analytics ?? null)
  }

  useEffect(() => {
    loadMine().catch((error) => setMessage(error.message))
  }, [token])

  useEffect(() => {
    loadPublicPoll().catch((error) => setMessage(error.message))
  }, [publicPollId])

  useEffect(() => {
    loadAnalytics(selectedPollId).catch((error) => setMessage(error.message))
  }, [selectedPollId, token])

  useEffect(() => {
    const pollId = publicPollId || selectedPollId
    if (!pollId) return

    const socket = io(API_URL)
    socket.emit('poll:join', pollId)
    socket.on('poll:analytics', (analytics: Analytics) => {
      if (publicPollId) setPublicAnalytics(analytics)
      if (selectedPollId === pollId) setSelectedAnalytics(analytics)
      loadMine().catch(() => undefined)
    })

    return () => {
      socket.disconnect()
    }
  }, [publicPollId, selectedPollId])

  async function submitAuth(event: React.FormEvent) {
    event.preventDefault()
    setMessage('')
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register'
    try {
      const data = await api(endpoint, { method: 'POST', body: JSON.stringify(authForm) })
      localStorage.setItem('pollforge_token', data.token)
      localStorage.setItem('pollforge_user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      setMessage('Signed in successfully.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed')
    }
  }

  async function createPoll(event: React.FormEvent) {
    event.preventDefault()
    setMessage('')
    const cleanQuestions = builder.questions.map((question) => ({
      ...question,
      options: question.options.filter((option) => option.label.trim()),
    }))

    try {
      const data = await api('/api/polls', {
        method: 'POST',
        body: JSON.stringify({
          ...builder,
          expiresAt: new Date(builder.expiresAt).toISOString(),
          questions: cleanQuestions,
        }),
      })
      setBuilder({ ...builder, title: '', description: '', questions: [blankQuestion()] })
      setSelectedPollId(data.poll.id)
      await loadMine()
      setMessage('Poll created. Share the public link when you are ready.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not create poll')
    }
  }

  async function submitResponse(event: React.FormEvent) {
    event.preventDefault()
    if (!publicPoll) return

    const missing = publicPoll.questions.find((question) => question.required && !answers[question.id!])
    if (missing) {
      setMessage(`Please answer: ${missing.text}`)
      return
    }

    try {
      await api(`/api/polls/${publicPoll.id}/responses`, {
        method: 'POST',
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId })),
        }),
      })
      setAnswers({})
      setMessage('Thanks, your feedback was submitted.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not submit response')
    }
  }

  async function publishPoll() {
    if (!selectedPollId) return
    const data = await api(`/api/polls/${selectedPollId}/publish`, { method: 'POST' })
    setSelectedAnalytics(data.analytics)
    await loadMine()
    setMessage('Final results published on the same public link.')
  }

  function updateQuestion(index: number, question: Question) {
    setBuilder((current) => ({
      ...current,
      questions: current.questions.map((item, itemIndex) => (itemIndex === index ? question : item)),
    }))
  }

  if (publicPollId) {
    return (
      <main className="app-shell public-page">
        <Message text={message} />
        {publicPoll && (
          <section className="public-layout">
            <header className="public-header">
              <span className="brand">PollForge</span>
              <span className={`status ${publicPoll.isPublished ? 'published' : publicPoll.isExpired ? 'closed' : 'live'}`}>
                {publicPoll.isPublished ? 'Results published' : publicPoll.isExpired ? 'Expired' : 'Accepting responses'}
              </span>
              <h1>{publicPoll.title}</h1>
              <p>{publicPoll.description}</p>
            </header>

            {publicPoll.isPublished && publicAnalytics ? (
              <AnalyticsPanel analytics={publicAnalytics} />
            ) : publicPoll.isExpired ? (
              <section className="panel"><h2>This poll has expired.</h2><p>Responses are closed until the creator publishes final results.</p></section>
            ) : (
              <form className="panel form-grid" onSubmit={submitResponse}>
                {publicPoll.responseMode === 'authenticated' && !token && (
                  <p className="notice">This poll requires sign-in. Use the account panel below before submitting.</p>
                )}
                {publicPoll.questions.map((question, index) => (
                  <fieldset className="question-block" key={question.id}>
                    <legend>{index + 1}. {question.text} {!question.required && <span>Optional</span>}</legend>
                    {question.options.map((option) => (
                      <label className="choice" key={option.id}>
                        <input
                          type="radio"
                          name={question.id}
                          checked={answers[question.id!] === option.id}
                          onChange={() => setAnswers((current) => ({ ...current, [question.id!]: option.id! }))}
                        />
                        {option.label}
                      </label>
                    ))}
                  </fieldset>
                ))}
                <button className="primary" type="submit">Submit feedback</button>
              </form>
            )}

            {!token && <AuthPanel authMode={authMode} setAuthMode={setAuthMode} authForm={authForm} setAuthForm={setAuthForm} onSubmit={submitAuth} />}
          </section>
        )}
      </main>
    )
  }

  return (
    <main className="app-shell">
      <Message text={message} />
      <nav className="topbar">
        <span className="brand">PollForge</span>
        {user ? (
          <button className="ghost" onClick={() => { localStorage.clear(); setToken(''); setUser(null); }}>Sign out</button>
        ) : null}
      </nav>

      <section className="workspace">
        <aside className="side-panel">
          {user ? (
            <>
              <h1>Poll workspace</h1>
              <p>Create shareable polls, collect single-choice feedback, and publish final outcomes.</p>
              <div className="stat-grid">
                <strong>{polls.length}<span>polls</span></strong>
                <strong>{polls.reduce((sum, poll) => sum + (poll.totalResponses ?? 0), 0)}<span>responses</span></strong>
              </div>
              <div className="poll-list">
                {polls.map((poll) => (
                  <button className={selectedPollId === poll.id ? 'active' : ''} key={poll.id} onClick={() => setSelectedPollId(poll.id)}>
                    <span>{poll.title}</span>
                    <small>{poll.totalResponses ?? 0} responses</small>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <AuthPanel authMode={authMode} setAuthMode={setAuthMode} authForm={authForm} setAuthForm={setAuthForm} onSubmit={submitAuth} />
          )}
        </aside>

        {user && (
          <section className="main-grid">
            <form className="panel builder" onSubmit={createPoll}>
              <h2>Create poll</h2>
              <input placeholder="Poll title" value={builder.title} onChange={(event) => setBuilder({ ...builder, title: event.target.value })} required />
              <textarea placeholder="Short description" value={builder.description} onChange={(event) => setBuilder({ ...builder, description: event.target.value })} />
              <div className="split">
                <label>Mode<select value={builder.responseMode} onChange={(event) => setBuilder({ ...builder, responseMode: event.target.value as 'anonymous' | 'authenticated' })}><option value="anonymous">Anonymous</option><option value="authenticated">Authenticated</option></select></label>
                <label>Expires<input type="datetime-local" value={builder.expiresAt} onChange={(event) => setBuilder({ ...builder, expiresAt: event.target.value })} required /></label>
              </div>
              {builder.questions.map((question, index) => (
                <div className="question-editor" key={index}>
                  <input placeholder={`Question ${index + 1}`} value={question.text} onChange={(event) => updateQuestion(index, { ...question, text: event.target.value })} required />
                  <label className="check"><input type="checkbox" checked={question.required} onChange={(event) => updateQuestion(index, { ...question, required: event.target.checked })} /> Mandatory</label>
                  {question.options.map((option, optionIndex) => (
                    <input key={optionIndex} placeholder={`Option ${optionIndex + 1}`} value={option.label} onChange={(event) => updateQuestion(index, { ...question, options: question.options.map((item, itemIndex) => itemIndex === optionIndex ? { label: event.target.value } : item) })} required={optionIndex < 2} />
                  ))}
                  <button className="ghost" type="button" onClick={() => updateQuestion(index, { ...question, options: [...question.options, { label: '' }] })}>Add option</button>
                </div>
              ))}
              <div className="actions">
                <button className="ghost" type="button" onClick={() => setBuilder({ ...builder, questions: [...builder.questions, blankQuestion()] })}>Add question</button>
                <button className="primary" type="submit">Create poll</button>
              </div>
            </form>

            <section className="panel analytics-card">
              <div className="panel-head">
                <h2>Analytics</h2>
                {selectedPollId && <button className="primary" type="button" onClick={publishPoll}>Publish results</button>}
              </div>
              {selectedPollId && <p className="share-link">{window.location.origin}/p/{selectedPollId}</p>}
              {selectedAnalytics ? <AnalyticsPanel analytics={selectedAnalytics} /> : <p>Select or create a poll to see live analytics.</p>}
            </section>
          </section>
        )}
      </section>
    </main>
  )
}

function Message({ text }: { text: string }) {
  return text ? <div className="toast">{text}</div> : null
}

function AuthPanel(props: {
  authMode: 'login' | 'register'
  setAuthMode: (mode: 'login' | 'register') => void
  authForm: { firstName: string; lastName: string; email: string; password: string }
  setAuthForm: (form: { firstName: string; lastName: string; email: string; password: string }) => void
  onSubmit: (event: React.FormEvent) => void
}) {
  return (
    <form className="auth-card" onSubmit={props.onSubmit}>
      <h2>{props.authMode === 'login' ? 'Sign in' : 'Create account'}</h2>
      {props.authMode === 'register' && (
        <div className="split">
          <input placeholder="First name" value={props.authForm.firstName} onChange={(event) => props.setAuthForm({ ...props.authForm, firstName: event.target.value })} required />
          <input placeholder="Last name" value={props.authForm.lastName} onChange={(event) => props.setAuthForm({ ...props.authForm, lastName: event.target.value })} required />
        </div>
      )}
      <input type="email" placeholder="Email" value={props.authForm.email} onChange={(event) => props.setAuthForm({ ...props.authForm, email: event.target.value })} required />
      <input type="password" placeholder="Password" value={props.authForm.password} onChange={(event) => props.setAuthForm({ ...props.authForm, password: event.target.value })} required minLength={6} />
      <button className="primary" type="submit">{props.authMode === 'login' ? 'Sign in' : 'Register'}</button>
      <button className="ghost" type="button" onClick={() => props.setAuthMode(props.authMode === 'login' ? 'register' : 'login')}>
        {props.authMode === 'login' ? 'Need an account?' : 'Already registered?'}
      </button>
    </form>
  )
}

function AnalyticsPanel({ analytics }: { analytics: Analytics }) {
  return (
    <div className="analytics">
      <div className="stat-grid">
        <strong>{analytics.totalResponses}<span>responses</span></strong>
        <strong>{analytics.participation.completionRate}%<span>completion</span></strong>
        <strong>{analytics.participation.anonymousResponses}<span>anonymous</span></strong>
      </div>
      {analytics.questions.map((question) => (
        <article className="result" key={question.id}>
          <h3>{question.text}</h3>
          <p>{question.answered} answered, {question.skipped} skipped</p>
          {question.options.map((option) => (
            <div className="bar-row" key={option.id}>
              <span>{option.label}</span><strong>{option.count}</strong>
              <div><i style={{ width: `${option.percent}%` }} /></div>
            </div>
          ))}
        </article>
      ))}
    </div>
  )
}

export default App
