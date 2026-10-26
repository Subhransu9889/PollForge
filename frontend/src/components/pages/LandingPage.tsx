import './landing-features.css'
import { HeroPreview } from '@/components/pages/HeroPreview'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { TypographyP } from '@/components/ui/typography'
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Copy,
  QrCode,
  Save,
  Download,
  Eye,
  MessageCircle,
  MousePointer2,
  RadioTower,
  ShieldCheck,
  Sparkles,
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

const highlights = [
  { icon: Copy, title: 'Great questions deserve a second round.', label: 'DUPLICATE POLLS', text: 'Reuse questions and settings in an editable copy. Start fresh with a new expiry and no previous responses.', detail: 'Copy → Review → Create', tone: 'mint' },
  { icon: QrCode, title: 'From your screen to their phone.', label: 'QR SHARING', text: 'Share a scannable poll code at a meeting, on a slide, or in person. Download the QR image and put it where your audience is.', detail: 'Scan → Open → Respond', tone: 'lavender' },
  { icon: Save, title: 'Pick up where you left off.', label: 'DRAFT AUTOSAVE', text: 'Your unfinished poll saves automatically as you work. Return to the builder to restore your draft, even after a reload.', detail: 'Saved per account in this browser · No cross-device sync', tone: 'peach' },
]

const reviews = [
  {
    name: 'Product teams',
    role: 'Prioritize with confidence',
    quote: 'Ask customers what matters most, compare feature ideas, and bring feedback into your next planning session.',
  },
  {
    name: 'Communities',
    role: 'Give everyone a voice',
    quote: 'Choose your next event, gather member feedback, and share the outcome with your community.',
  },
  {
    name: 'Everyday collaboration',
    role: 'Move a decision forward',
    quote: 'Send one link to your team, collect responses in one place, and publish results everyone can reference.',
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
          <a href="#use-cases">Use cases</a>
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
            Better questions. Clearer decisions.
          </div>
          <h1>One question.<br />Many voices.<br /><span className="hero-highlight">A clear direction.</span></h1>
          <TypographyP>
            Bring every voice into the conversation. Create a poll, share it anywhere, and watch the answers become your next big decision.
          </TypographyP>
          <div className="hero-cta">
            <Link className="landing-button primary large" to={dashboardHref}>
              Start building
              <ArrowRight className="size-4" />
            </Link>
            <a className="landing-button outline large" href="#overview">Explore the features</a>
          </div>
          <div className="hero-proof">
            <span><CheckCircle2 className="size-4" /> Anonymous or authenticated</span>
            <span><CheckCircle2 className="size-4" /> Realtime analytics</span>
            <span><CheckCircle2 className="size-4" /> Shareable results</span>
          </div>
        </div>

        <HeroPreview />
      </section>

      <section className="overview-section" id="overview">
        <div className="section-heading">
          <p className="eyebrow">How it works</p>
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

      <section className="landing-highlights" id="features" aria-labelledby="highlights-heading">
        <div className="section-heading">
          <p className="eyebrow">Less busywork. More perspective.</p>
          <h2 id="highlights-heading">Small details.<br />A better polling experience.</h2>
          <p className="highlights-intro">Keep your momentum from the first draft to the next conversation.</p>
        </div>
        <div className="highlight-grid">
          {highlights.map(feature => (
            <article className={`highlight-card highlight-${feature.tone}`} key={feature.label}>
              <div className="highlight-icon" aria-hidden="true"><feature.icon size={25} /></div>
              <p className="highlight-label">{feature.label}</p>
              <h3>{feature.title}</h3>
              <p className="highlight-description">{feature.text}</p>
              <div className="highlight-detail"><CheckCircle2 size={14} aria-hidden="true" /><span>{feature.detail}</span></div>
            </article>
          ))}
        </div>
        <article className="landing-analysis-highlight">
          <div>
            <p className="eyebrow">Understand the answers</p>
            <h3>A clearer view of every response.</h3>
            <p>Compare choices, explore participation, and see which questions get answered. Switch between charts and detailed counts, then take the results with you.</p>
            <Link to={dashboardHref} className="landing-button outline">Explore your workspace<ArrowRight size={16} /></Link>
          </div>
          <ul className="analysis-feature-list">
            <li><BarChart3 aria-hidden="true" /><div><strong>Results you can read at a glance</strong><span>Question breakdowns, vote comparisons, and answer coverage.</span></div></li>
            <li><Download aria-hidden="true" /><div><strong>Your results, ready to export</strong><span>Download one poll or all polls as CSV, with names and IDs included.</span></div></li>
            <li><ShieldCheck aria-hidden="true" /><div><strong>Participation on your terms</strong><span>Choose anonymous or signed-in responses and set an expiry.</span></div></li>
          </ul>
        </article>
      </section>

      <section className="reviews-section" id="use-cases">
        <div className="section-heading">
          <p className="eyebrow">Made for your questions</p>
          <h2>Teams use PollForge when the answer needs to be shared.</h2>
        </div>
        <div className="reviews-grid">
          {reviews.map((review) => (
            <article className="review-card" key={review.name}>
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
      <footer className="product-footer" aria-label="Site footer">
        <div className="product-footer-main">
          <div className="product-footer-brand">
            <Link to="/" className="brand-lockup" aria-label="PollForge home">
              <span className="brand-mark"><BarChart3 className="size-5" aria-hidden="true" /></span>
              <span>PollForge</span>
            </Link>
            <p>Bring people into the conversation.<br />Turn their responses into a clearer direction.</p>
          </div>
          <nav className="product-footer-links" aria-label="Product">
            <h2>Product</h2>
            <a href="#overview">How it works</a>
            <a href="#features">Features</a>
            <a href="#use-cases">Use cases</a>
            <Link to={dashboardHref}>Your workspace<ArrowRight size={14} aria-hidden="true" /></Link>
          </nav>
          <div className="product-footer-support">
            <h2>A little help goes a long way.</h2>
            <p>Have a question or an idea for PollForge? Visit the creator’s portfolio to get in touch.</p>
            <a href="https://subransu.com" target="_blank" rel="noopener noreferrer" className="product-support-link">
              Support<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> — opens Subransu’s portfolio in a new tab</span>
            </a>
          </div>
        </div>
        <div className="product-footer-bottom">
          <span>© {new Date().getFullYear()} PollForge. All rights reserved.</span>
          <a href="https://subransu.com" target="_blank" rel="noopener noreferrer">Built by Subransu<ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> — opens in a new tab</span></a>
        </div>
      </footer>
    </main>
  )
}
