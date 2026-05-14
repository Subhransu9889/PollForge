import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { TypographyP } from '@/components/ui/typography'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Eye,
  Gauge,
  MessageCircle,
  MousePointer2,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
} from 'lucide-react'

const features = [
  {
    icon: MousePointer2,
    title: 'One-screen builder',
    text: 'Draft questions, options, expiry, and response rules without leaving the flow.',
  },
  {
    icon: RadioTower,
    title: 'Realtime signal',
    text: 'Watch answers update live as respondents submit feedback from the public page.',
  },
  {
    icon: Eye,
    title: 'Published outcomes',
    text: 'Close the loop with final results that are easy for everyone to scan.',
  },
]

const reviews = [
  {
    name: 'Maya S.',
    role: 'Product Lead',
    quote: 'PollForge replaced three scattered forms for us. The share link and live results made decisions feel much cleaner.',
  },
  {
    name: 'Arjun K.',
    role: 'Community Manager',
    quote: 'The public poll page feels polished enough to send to customers without explaining anything first.',
  },
  {
    name: 'Nina R.',
    role: 'Founder',
    quote: 'Fast to create, simple to answer, and the published result page gives every stakeholder the same picture.',
  },
]

export function LandingPage() {
  const { token, user } = useAuth()
  const dashboardHref = token && user ? '/dashboard' : '/signup'

  return (
    <main className="app-shell landing-shell">
      <nav className="landing-nav">
        <Link to="/" className="brand-lockup">
          <div className="brand-mark apple-icon">
            <BarChart3 className="size-5" />
          </div>
          <span>PollForge</span>
        </Link>
        <div className="landing-nav-actions">
          <a href="#overview">Overview</a>
          <a href="#reviews">Reviews</a>
          {token && user ? (
            <Link className="landing-button primary" to="/dashboard">Dashboard</Link>
          ) : (
            <>
              <Link className="landing-button ghost" to="/signin">Sign in</Link>
              <Link className="landing-button primary" to="/signup">Sign up</Link>
            </>
          )}
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-copy">
          <div className="hero-badge">
            <Sparkles className="size-4" />
            Premium Designed Live Poll
          </div>
          <h1>Polls that feel clear, calm, and instantly useful.</h1>
          <TypographyP>
            PollForge is a modern platform for creating public polls, collecting feedback, and publishing insights with a smooth real-time experience.
          </TypographyP>
          <div className="hero-cta">
            <Link className="landing-button primary large" to={dashboardHref}>
              Start building
              <ArrowRight className="size-4" />
            </Link>
            <a className="landing-button outline large" href="#overview">Watch overview</a>
          </div>
          <div className="hero-proof">
            <span><CheckCircle2 className="size-4" /> Anonymous or authenticated</span>
            <span><CheckCircle2 className="size-4" /> Realtime analytics</span>
            <span><CheckCircle2 className="size-4" /> Published reviews</span>
          </div>
        </div>

        <div className="hero-device" aria-hidden="true">
          <div className="device-glow" />
          <div className="glass-device">
            <div className="device-top">
              <div className="traffic-lights">
                <i />
                <i />
                <i />
              </div>
              <span>Live Poll Overview</span>
            </div>
            <div className="device-body">
              <div className="floating-card card-question">
                <span className="mini-label">Today</span>
                <strong>Which launch message wins?</strong>
                <div className="poll-option active">
                  <span>Simple and fast</span>
                  <b>64%</b>
                </div>
                <div className="poll-option">
                  <span>Powerful analytics</span>
                  <b>28%</b>
                </div>
                <div className="poll-option">
                  <span>Shareable decisions</span>
                  <b>8%</b>
                </div>
              </div>
              <div className="floating-card card-stats">
                <Gauge className="size-5 text-primary" />
                <strong>94%</strong>
                <span>completion</span>
              </div>
              <div className="floating-card card-users">
                <UsersRound className="size-5 text-secondary" />
                <strong>2.4k</strong>
                <span>responses</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overview-section" id="overview">
        <div className="section-heading">
          <p className="eyebrow">Animated Overview</p>
          <h2>A smoother path from question to decision.</h2>
        </div>
        <div className="overview-timeline">
          {features.map((feature, index) => (
            <article className="glass-feature" key={feature.title} style={{ animationDelay: `${index * 120}ms` }}>
              <div className="apple-icon">
                <feature.icon className="size-5" />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="reviews-section" id="reviews">
        <div className="section-heading">
          <p className="eyebrow">Poll Reviews</p>
          <h2>Teams use PollForge when the answer needs to be shared.</h2>
        </div>
        <div className="reviews-grid">
          {reviews.map((review) => (
            <article className="review-card" key={review.name}>
              <div className="review-stars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star className="size-4" fill="currentColor" key={index} />
                ))}
              </div>
              <p>{review.quote}</p>
              <div>
                <strong>{review.name}</strong>
                <span>{review.role}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-final">
        <div className="apple-icon">
          <MessageCircle className="size-6" />
        </div>
        <h2>Start with one question. End with a decision everyone can see.</h2>
        <div className="hero-cta">
          <Link className="landing-button primary large" to={dashboardHref}>
            Create your first poll
            <ArrowRight className="size-4" />
          </Link>
          <span><Clock3 className="size-4" /> Setup takes less than a minute</span>
          <span><ShieldCheck className="size-4" /> Clean response modes</span>
        </div>
      </section>
    </main>
  )
}
