# PollForge

PollForge is a full-stack polling platform for creating shareable single-choice polls, collecting anonymous or authenticated feedback, watching live analytics, and publishing final results on the same public link.

## Features

- Email/password authentication with protected creator routes.
- Dynamic poll builder with multiple questions, required/optional validation, and two or more options per question.
- Anonymous and authenticated response modes.
- Public poll links at `/p/:pollId`.
- Expiry timestamps that stop further submissions after the deadline.
- Creator analytics with total responses, question summaries, option counts, skipped counts, and completion rate.
- Publish flow that exposes final results publicly on the same poll link.
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

## Submission Links

- Public GitHub repository: https://github.com/Subhransu9889/PollForge
- Deployed project: https://pollforge-nine.vercel.app
