import { useState, type CSSProperties } from 'react'
import { ArrowUpRight, BarChart3, Check, Pause, Play, RadioTower, UsersRound } from 'lucide-react'
import './hero-preview.css'

const options = [
  { label: 'Make it simple', value: 64, color: '#5eead4' },
  { label: 'Make it powerful', value: 28, color: '#a5b4fc' },
  { label: 'Make it personal', value: 8, color: '#f9bd87' },
]

export function HeroPreview() {
  const [paused, setPaused] = useState(false)

  return (
    <div className={`hero-motion ${paused ? 'is-paused' : ''}`}>
      <div className="hero-motion-stage" role="img" aria-label="Illustrated example poll: Make it simple leads with 64 percent, followed by Make it powerful at 28 percent and Make it personal at 8 percent.">
        <div className="hero-orbit hero-orbit-one" aria-hidden="true"><i /></div>
        <div className="hero-orbit hero-orbit-two" aria-hidden="true"><i /></div>
        <div className="hero-ambient" aria-hidden="true" />
        <div className="hero-result-window" aria-hidden="true">
          <div className="hero-window-toolbar">
            <span><BarChart3 size={16} /> PollForge <span className="hero-toolbar-divider">/</span> Launch day</span>
            <span className="hero-live-label"><i /> Live</span>
          </div>
          <div className="hero-window-content">
            <div className="hero-poll-meta"><span>TEAM DECISIONS</span><span>01 / 03</span></div>
            <h2>What should our next<br />chapter feel like?</h2>
            <p>Good ideas start with a shared perspective.</p>
            <div className="hero-answer-list">
              {options.map((option, index) => (
                <div className="hero-answer" key={option.label} style={{ '--bar-width': `${option.value}%`, '--bar-color': option.color, '--bar-delay': `${index * 160}ms` } as CSSProperties}>
                  <div className="hero-answer-label"><span><i>{index === 0 ? <Check size={12} /> : String.fromCharCode(65 + index)}</i>{option.label}</span><strong>{option.value}<small>%</small></strong></div>
                  <div className="hero-answer-track"><div /></div>
                </div>
              ))}
            </div>
            <div className="hero-window-footer"><span><UsersRound size={14} /> 128 responses</span><span><RadioTower size={14} /> Updating live</span></div>
          </div>
        </div>
        <div className="hero-response-toast" aria-hidden="true"><span className="hero-toast-check"><Check size={17} /></span><div><strong>Another voice, heard.</strong><span>New response received</span></div><span className="hero-toast-dot" /></div>
        <div className="hero-insight-card" aria-hidden="true">
          <div><span>THE BIG PICTURE</span><ArrowUpRight size={17} /></div>
          <strong>Clarity, in real time.</strong>
          <div className="hero-sparkline">{[22, 35, 28, 48, 40, 62, 54, 75, 69, 88, 80, 100].map((height, index) => <i key={index} style={{ '--spark-height': `${height}%`, '--bar-delay': `${index * 85}ms` } as CSSProperties} />)}</div>
        </div>
      </div>
      <div className="hero-preview-caption"><span>EXAMPLE POLL · REAL POSSIBILITIES</span><button type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Play preview animation' : 'Pause preview animation'} aria-pressed={paused}>{paused ? <Play size={13} /> : <Pause size={13} />}<span>{paused ? 'Play motion' : 'Pause motion'}</span></button></div>
    </div>
  )
}
