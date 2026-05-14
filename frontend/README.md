# PollForge Frontend

PollForge is a React, TypeScript, Vite, and Tailwind CSS frontend for a realtime polling and feedback platform. The current build is a polished single-page product experience that presents the brand, a live poll workspace, realtime analytics, feature cards, and a recent activity stream.

## Tech Stack

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- ESLint 10

## Current Progress

- Replaced the default Vite screen with a custom PollForge interface.
- Added a responsive top navigation with PollForge branding, section links, and a create poll action.
- Built a first-screen hero for the realtime opinion-forging platform.
- Added primary and secondary call-to-action buttons.
- Added capability chips for public links, anonymous mode, and live charts.
- Built a live poll workspace panel with poll status, question metadata, answer options, live percentages, and a share link strip.
- Added metrics for responses forged, completion rate, and median answer time.
- Built a live analytics section with outcome distribution bars.
- Added a realtime signal panel with radial visual treatment.
- Added three feature cards that describe poll creation, realtime analysis, and decision-making.
- Added a feedback stream section for recent activity.
- Added responsive layouts for desktop, tablet, and mobile breakpoints.
- Added global focus-visible styling for keyboard accessibility.
- Added custom favicon/logo assets in `public`.

## Run Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```text
frontend/
  public/
    favicon.svg
    icons.svg
    logo.png
  src/
    App.css
    App.tsx
    index.css
    main.tsx
    assets/
      hero.png
      react.svg
      vite.svg
  index.html
  package.json
  vite.config.ts
```

## Color System

The app currently uses a dark realtime dashboard palette with warm PollForge brand accents and bright signal colors. Core tokens are defined on `.app-shell` in `src/App.css`, while global defaults are defined in `src/index.css`.

### Core CSS Variables

| Token | Color Code | Current Usage |
| --- | --- | --- |
| `--bg` | `#050609` | Main app, html, and body background |
| `--panel` | `rgba(16, 19, 26, 0.82)` | Reserved translucent panel surface |
| `--panel-strong` | `#111722` | Strong panel surface and option radio inset |
| `--line` | `rgba(255, 255, 255, 0.11)` | Borders and subtle dividers |
| `--text` | `#f5f7fb` | Primary text |
| `--muted` | `#9ba5b8` | Secondary body copy |
| `--soft` | `#c9d2e4` | Softer labels, nav links, and chips |
| `--ember` | `#ff6b35` | Primary warm brand accent |
| `--gold` | `#ffbd59` | Highlight accent and warm gradients |
| `--cyan` | `#18e3d7` | Realtime and analytics accent |
| `--violet` | `#9b7cff` | Third poll option accent |
| `--green` | `#55f6a8` | Live status, activity, and positive signal accent |

### Global Base Colors

| Area | Color Code |
| --- | --- |
| Root text | `#f5f7fb` |
| Root background | `#050609` |
| HTML background | `#050609` |
| Body background | `#050609` |
| Focus outline | `rgba(24, 227, 215, 0.7)` |

### Background Treatments

| Element | Color Details |
| --- | --- |
| App warm radial glow | `rgba(255, 107, 53, 0.18)` |
| App cyan radial glow | `rgba(24, 227, 215, 0.1)` |
| App vertical background gradient | `#080a0f` to `#050609` to `#030406` |
| Grid overlay lines | `rgba(255, 255, 255, 0.035)` |
| Nav glass background | `rgba(255, 255, 255, 0.045)` |
| Nav hover background | `rgba(255, 255, 255, 0.08)` |
| Nav action background | `rgba(255, 107, 53, 0.1)` |
| Panel gradient surface | `rgba(18, 23, 33, 0.9)` to `rgba(9, 12, 18, 0.9)` |
| Card soft surface | `rgba(255, 255, 255, 0.045)` |
| Chip soft surface | `rgba(255, 255, 255, 0.065)` |
| Option row surface | `rgba(4, 6, 10, 0.52)` |
| Share strip surface | `rgba(255, 107, 53, 0.08)` |
| Bar track surface | `rgba(255, 255, 255, 0.08)` |
| Feature icon background | `rgba(255, 255, 255, 0.06)` |

### Accent Gradients

| Name | Color Code |
| --- | --- |
| Brand mark panel gradient | `linear-gradient(145deg, rgba(255, 107, 53, 0.26), rgba(24, 227, 215, 0.08))` |
| Brand mark warm bars | `linear-gradient(180deg, #ffbd59, #ff6b35)` |
| Brand mark cool bar | `linear-gradient(180deg, #18e3d7, #55f6a8)` |
| Primary button | `linear-gradient(135deg, #ffbd59, #ff6b35)` |
| Ember poll tone | `linear-gradient(90deg, #ff6b35, #ffbd59)` |
| Cyan poll tone | `linear-gradient(90deg, #18e3d7, #55f6a8)` |
| Violet poll tone | `linear-gradient(90deg, #9b7cff, #d9b8ff)` |

### Borders, Shadows, and Special States

| Element | Color Code |
| --- | --- |
| Brand mark border | `rgba(255, 189, 89, 0.28)` |
| Brand mark shadow | `rgba(255, 107, 53, 0.22)` |
| Nav action border | `rgba(255, 189, 89, 0.35)` |
| Primary button text | `#130806` |
| Primary button shadow | `rgba(255, 107, 53, 0.3)` |
| Status pill text | `#06130d` |
| Status pill shadow | `rgba(85, 246, 168, 0.35)` |
| Live dot shadow ring | `rgba(85, 246, 168, 0.12)` |
| Live dot glow | `rgba(85, 246, 168, 0.8)` |
| Option hover border | `rgba(255, 189, 89, 0.38)` |
| Share strip border | `rgba(255, 189, 89, 0.16)` |
| Share button text | `#06130d` |
| Realtime orbit gold fill | `rgba(255, 189, 89, 0.2)` |
| Realtime orbit cyan rings | `rgba(24, 227, 215, 0.16)` |
| Realtime orbit border | `rgba(24, 227, 215, 0.16)` |
| Realtime orbit ember glow | `rgba(255, 107, 53, 0.7)` |
| Realtime orbit gold border | `rgba(255, 189, 89, 0.42)` |
| Realtime orbit cyan border | `rgba(24, 227, 215, 0.34)` |
| Activity dot glow | `rgba(85, 246, 168, 0.65)` |

## Responsive Progress

- Landing hero uses a single-column mobile layout and switches to a two-column copy/device composition on large screens.
- Hero CTAs stack full-width on mobile, then wrap into inline actions from the small breakpoint upward.
- Feature, review, metric, and analytics grids start as single-column stacks and expand into multi-column layouts on medium, large, and extra-large screens.
- Published poll results use collapsed question cards by default so public users see only the question, response count, and a `View Details` action until they expand a card.
- Analytics detail cards, option rows, and charts keep responsive spacing and wrapping so long questions and answer labels do not overflow on narrow screens.
- Auth, dashboard, poll builder, and public poll surfaces use constrained widths with mobile-first padding, then widen into denser desktop layouts.

