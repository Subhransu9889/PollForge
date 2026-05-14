# PollForge

PollForge is a full-stack polling platform for creating shareable polls with multiple-choice and text-response questions, collecting anonymous or authenticated feedback, watching live analytics, and publishing final results on the same public link.

## Features

- Email/password authentication with protected creator routes.
- Dynamic poll builder with multiple questions, required/optional validation, multiple-choice questions, and free-text response questions.
- Anonymous and authenticated response modes.
- Per-device duplicate protection for anonymous polls to prevent repeated responses from the same browser/device.
- API rate limiting, response attempt limits, and response cooldowns to reduce spam and rapid automation.
- Customizable post-submit thank-you popup with required PollForge attribution.
- Public poll links at `/p/:pollId`.
- Expiry timestamps that stop further submissions after the deadline.
- Creator analytics with total responses, question summaries, option counts, text responses, skipped counts, and completion rate.
- Publish flow that exposes final results publicly on the same poll link with collapsed question cards and expandable details.
- Socket.io realtime updates for live response counts and analytics refreshes.

## Tech Stack

- Frontend: React, TypeScript, Vite, Socket.io client
- Backend: Express, TypeScript, MongoDB, Mongoose, JWT, bcryptjs, Socket.io

## Local Setup

Install dependencies:

```bash
cd backend
npm install
cd ../frontend
npm install
```

Create `backend/.env`:

```bash
PORT=your_port
MONGODB_URI=your_uri_here
JWT_SECRET=your_secret_here
FRONTEND_URL=http://localhost:5173
```

Optionally create `frontend/.env`:

```bash
VITE_API_URL=http://localhost:PORT
```

For deployment, set the same backend variables on your backend host:

```bash
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-random_secret
FRONTEND_URL=your-frontend-url
```

If either `MONGODB_URI` or `JWT_SECRET` is missing, authentication cannot work.

Run the backend:

```bash
cd backend
npm run dev
```

Run the frontend:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## Main API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/polls/mine`
- `POST /api/polls`
- `GET /api/polls/:id`
- `POST /api/polls/:id/responses`
- `GET /api/polls/:id/analytics`
- `POST /api/polls/:id/publish`

## Abuse Protection

- General API traffic is limited to 100 requests per 5 minutes per client.
- Poll response submissions are limited to 10 attempts per minute.
- Valid response writes use a 30-second cooldown per poll/user or poll/device.
- Anonymous poll responses include a persistent browser device id so one browser/device cannot submit twice to the same poll.

## Submission Links

- Public GitHub repository: https://github.com/Subhransu9889/PollForge
- Deployed project: https://pollforge-nine.vercel.app
