import './App.css'

const pollOptions = [
  { label: 'Launch live result wall', value: 46, tone: 'ember' },
  { label: 'Add anonymous feedback mode', value: 31, tone: 'cyan' },
  { label: 'Publish weekly insight reports', value: 23, tone: 'violet' },
]

const activity = [
  { name: 'Product council', action: 'voted on roadmap priority', time: 'Now' },
  { name: 'Community beta', action: 'added 128 new responses', time: '2m' },
  { name: 'Leadership sync', action: 'published sentiment snapshot', time: '7m' },
]

const features = [
  {
    title: 'Create polls that feel alive',
    text: 'Build required or optional questions, anonymous or authenticated flows, and share-ready public links.',
  },
  {
    title: 'Watch opinion form in realtime',
    text: 'Live response counts, trend bars, sentiment signals, and outcome publishing make every poll actionable.',
  },
  {
    title: 'Forge decisions from feedback',
    text: 'Turn scattered opinions into visual summaries your team can trust, discuss, and ship from.',
  },
]

const metrics = [
  { value: '18.4k', label: 'responses forged' },
  { value: '92%', label: 'completion rate' },
  { value: '4.8s', label: 'median answer time' },
]

const App = () => {
  return (
    <main className="app-shell">
      <nav className="topbar" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="PollForge home">
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          <span>PollForge</span>
        </a>
        <div className="nav-links">
          <a href="#workspace">Workspace</a>
          <a href="#analytics">Analytics</a>
          <a href="#insights">Insights</a>
        </div>
        <a className="nav-action" href="#workspace">Create poll</a>
      </nav>

      <section className="hero-section" id="top">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="live-dot" />
            Realtime opinion-forging platform
          </span>
          <h1>Forge insights from live community feedback.</h1>
          <p>
            PollForge helps teams create interactive polls, share public links,
            collect responses, and visualize decisions as they happen.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#workspace">Start forging</a>
            <a className="secondary-button" href="#analytics">View live analytics</a>
          </div>
          <div className="trust-row" aria-label="Platform capabilities">
            <span>Public links</span>
            <span>Anonymous mode</span>
            <span>Live charts</span>
          </div>
        </div>

        <section className="poll-studio" id="workspace" aria-label="Live poll workspace">
          <div className="studio-header">
            <div>
              <span className="panel-kicker">Live poll</span>
              <h2>What should we prioritize next?</h2>
            </div>
            <span className="status-pill">Live</span>
          </div>

          <div className="question-card">
            <div className="question-meta">
              <span>Required</span>
              <span>Anonymous</span>
            </div>
            <p className="question-title">Pick the product move with the highest impact.</p>
            <div className="option-list">
              {pollOptions.map((option) => (
                <button className="option-row" key={option.label} type="button">
                  <span className={`option-radio ${option.tone}`} />
                  <span>{option.label}</span>
                  <strong>{option.value}%</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="share-strip">
            <div>
              <span className="panel-kicker">Share link</span>
              <p>pollforge.app/p/roadmap-live</p>
            </div>
            <button type="button">Copy</button>
          </div>
        </section>
      </section>

      <section className="metrics-grid" aria-label="PollForge performance metrics">
        {metrics.map((metric) => (
          <div className="metric" key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </section>

      <section className="analytics-section" id="analytics">
        <div className="section-heading">
          <span className="eyebrow">Live analytics</span>
          <h2>Responses become signals the moment they arrive.</h2>
        </div>

        <div className="analytics-layout">
          <div className="result-panel">
            <div className="panel-topline">
              <span>Outcome distribution</span>
              <strong>1,284 responses</strong>
            </div>
            <div className="bar-stack">
              {pollOptions.map((option) => (
                <div className="bar-item" key={option.label}>
                  <div className="bar-label">
                    <span>{option.label}</span>
                    <strong>{option.value}%</strong>
                  </div>
                  <div className="bar-track">
                    <span className={option.tone} style={{ width: `${option.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="signal-panel">
            <div className="pulse-orbit" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div>
              <span className="panel-kicker">Realtime signal</span>
              <h3>Sentiment rising across public respondents</h3>
              <p>Strong agreement is forming around live results and transparent publishing.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-section" id="insights">
        {features.map((feature) => (
          <article className="feature-card" key={feature.title}>
            <span className="feature-icon" aria-hidden="true" />
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>

      <section className="activity-section" aria-label="Recent live activity">
        <div className="section-heading compact">
          <span className="eyebrow">Feedback stream</span>
          <h2>Public input, shaped into published outcomes.</h2>
        </div>
        <div className="activity-list">
          {activity.map((item) => (
            <div className="activity-item" key={`${item.name}-${item.time}`}>
              <span className="activity-dot" />
              <div>
                <strong>{item.name}</strong>
                <p>{item.action}</p>
              </div>
              <time>{item.time}</time>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
