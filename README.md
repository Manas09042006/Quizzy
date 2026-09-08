<<<<<<< HEAD
# 🎓 Quizzy — Developer Guide

> A full-stack Quiz Application with **Admin** and **User** roles, real-time quiz lifecycle control, anti-cheat full-screen enforcement, per-question countdown timers, and live admin surveillance.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Running the App](#-running-the-app)
- [Demo Accounts](#-demo-accounts)
- [Features Overview](#-features-overview)
- [API Reference](#-api-reference)
- [Architecture & Key Concepts](#-architecture--key-concepts)
- [Building for Production](#-building-for-production)
- [Git Workflow](#-git-workflow)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express 5, TypeScript |
| **Database** | MongoDB (Mongoose) + In-Memory Fallback (no MongoDB needed) |
| **Auth** | JWT (JSON Web Tokens) + bcryptjs |
| **Real-Time** | Server-Sent Events (SSE) |
| **Validation** | Joi |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
Quizzy/
├── client/                   # React Frontend (Vite)
│   ├── src/
│   │   ├── api/              # Axios API setup
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── FullScreenWarningModal.tsx
│   │   │   └── ResultChart.tsx
│   │   ├── context/          # React Contexts
│   │   │   ├── authContext.tsx
│   │   │   ├── ErrorContext.tsx
│   │   │   └── SuccessContext.tsx
│   │   ├── pages/
│   │   │   ├── AuthPage.tsx         # Login / Register
│   │   │   ├── UserDashboard.tsx    # Student Dashboard
│   │   │   ├── QuizList.tsx         # Browse all quizzes
│   │   │   ├── WaitingRoom.tsx      # Lobby before quiz starts
│   │   │   ├── TakeQuiz.tsx         # Full-screen exam engine
│   │   │   ├── Result.tsx           # Submission confirmation
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx   # Admin control center
│   │   │       └── MonitorQuiz.tsx      # Live quiz surveillance
│   │   └── App.tsx
│   ├── .env                  # Frontend environment variables
│   └── package.json
│
├── server/                   # Express Backend
│   ├── src/
│   │   ├── controllers/      # Route handler logic
│   │   │   ├── authController.ts
│   │   │   ├── quizController.ts
│   │   │   ├── adminController.ts
│   │   │   └── liveController.ts    # SSE streams
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts    # JWT + Admin guard
│   │   ├── models/           # Mongoose schemas
│   │   │   ├── User.ts
│   │   │   ├── Quiz.ts
│   │   │   └── Result.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── quizRoutes.ts
│   │   │   ├── adminRoutes.ts
│   │   │   └── liveRoutes.ts
│   │   ├── utils/
│   │   │   └── mockStore.ts   # In-memory DB fallback
│   │   ├── validators/
│   │   │   └── quizValidator.ts
│   │   └── index.ts           # Express app entry point
│   ├── .env                   # Backend environment variables
│   └── package.json
│
└── README.md
```

---

## ✅ Prerequisites

Make sure the following are installed on your machine:

- **Node.js** v18 or higher → [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
- **Git** → [git-scm.com](https://git-scm.com)
- **MongoDB** *(optional)* → [mongodb.com](https://mongodb.com) — The app works without MongoDB using an automatic in-memory fallback.

To verify installations:
```bash
node --version    # v18+
npm --version     # v9+
git --version
```

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/vedant4375/Quizzy.git
cd Quizzy
```

### 2. Install Server dependencies

```bash
cd server
npm install
```

### 3. Install Client dependencies

```bash
cd ../client
npm install
```

---

## 🔐 Environment Variables

### Server — `server/.env`

Create the file `server/.env` with the following:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/quizzes
JWT_SECRET=your_secret_key_here
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port the Express server runs on | `4000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/quizzes` |
| `JWT_SECRET` | Secret key used to sign JWT tokens | *(required)* |

> ⚠️ **No MongoDB?** No problem! If MongoDB is not running, the app automatically switches to an **in-memory store** with pre-seeded demo data.

---

### Client — `client/.env`

Create the file `client/.env` with the following:

```env
VITE_API_BASE=http://localhost:4000/api
```

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE` | URL of the backend API |

---

## ▶️ Running the App

You need **two terminals** — one for the server and one for the client.

### Terminal 1 — Start the Backend Server

```bash
cd server
npm run dev
```

Server starts at: **http://localhost:4000**

---

### Terminal 2 — Start the Frontend

```bash
cd client
npm run dev
```

Frontend starts at: **http://localhost:5173**

Open your browser and go to → **http://localhost:5173**

---

## 👤 Demo Accounts

The app comes with **pre-seeded demo accounts** — no signup required!

| Role | Email | Password |
|------|-------|----------|
| 👑 **Admin** | `admin@quizzy.io` | `admin123` |
| 🎓 **Student** | `student@quizzy.io` | `user123` |

> You can also click the **"Demo Admin"** or **"Demo Student"** quick-fill buttons on the login page.

---

## ✨ Features Overview

### 🔐 Authentication & Roles
- Single login/register portal for both Admin and User
- Role-based JWT authentication
- Admin pages protected — students are redirected automatically

### 🧑‍💼 Admin Features
| Feature | Description |
|---------|-------------|
| Create Quiz | Add title, description, questions, options, correct answers, marks, and per-question timers |
| Quiz Status Control | Set quiz to `Draft` (waiting), `Active` (live), or `Ended` (closed) |
| Start / Stop Quiz | Real-time control — users are notified instantly via SSE |
| Live Monitor | See participant scores, completion status, and anti-cheat violations in real time |
| Audit Log | Inspect exact timestamped violation logs per candidate |

### 🎓 Student Features
| Feature | Description |
|---------|-------------|
| Dashboard | View available assessments with Attempted / Not Attempted status |
| Waiting Room | Wait in lobby until Admin starts the quiz |
| Full-Screen Exam | Distraction-free full-screen quiz mode |
| Per-Question Timer | Each question has its own countdown — auto-submits when timer ends |
| Anti-Cheat | Detects tab switches, window minimization, focus loss, and full-screen exits |
| Submission History | View which quizzes were submitted (no scores shown — Admin only) |

### 🛡️ Anti-Cheat Engine
- **Full-Screen Mode** enforced before exam starts
- Violations detected:
  - Exiting full-screen
  - Switching browser tabs
  - Minimizing window
  - Switching to external apps (focus loss)
- **3 violations** → auto-terminate and submit with status `terminated_violations`
- All violations timestamped and logged for Admin review

---

## 📡 API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT token |
| GET | `/api/auth/dashboard` | ✅ User | Get user's attempt history |

### Quiz Routes — `/api/quizzes`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/quizzes` | ✅ | List all quizzes with status |
| GET | `/api/quizzes/:id` | ✅ | Get single quiz details |
| POST | `/api/quizzes` | ✅ Admin | Create a new quiz |
| POST | `/api/quizzes/:id/submit` | ✅ User | Submit quiz answers + violations |
| GET | `/api/quizzes/:id/result` | ✅ Admin | Get full result with answers (Admin only) |

### Admin Routes — `/api/admin`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/overview` | ✅ Admin | Stats: total quizzes, submissions, flags |
| PATCH | `/api/admin/quizzes/:id/status` | ✅ Admin | Change quiz status (`draft`/`active`/`ended`) |
| GET | `/api/admin/quizzes/:id/monitor` | ✅ Admin | Live participant data for a quiz |
| PUT | `/api/admin/quizzes/:id` | ✅ Admin | Edit a quiz |
| DELETE | `/api/admin/quizzes/:id` | ✅ Admin | Delete a quiz |

### Real-Time (SSE) Routes — `/api/live`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/live/quiz/:id` | ✅ | Student SSE stream — notified when Admin starts quiz |
| GET | `/api/live/admin/:id` | ✅ Admin | Admin SSE stream — notified on submissions |

---

## 🏗️ Architecture & Key Concepts

### Quiz Status Lifecycle
```
draft  →  active  →  ended
  (Waiting)  (Live)  (Closed)
```

### Dual-Mode Database
The server automatically detects whether MongoDB is available:
- **MongoDB connected** → Uses Mongoose models
- **MongoDB offline** → Falls back to `mockStore.ts` (in-memory, pre-seeded)

### JWT Authentication Flow
```
Client Login → Server issues JWT → Client stores in localStorage
→ Every request sends: Authorization: Bearer <token>
→ Server validates token → checks role for admin routes
```

### Real-Time SSE Flow
```
Admin clicks "Start Quiz"
  → PATCH /api/admin/quizzes/:id/status  { status: "active" }
  → broadcastQuizStatusChange(quizId, "active")
  → All connected students in /api/live/quiz/:id receive event
  → WaitingRoom.tsx auto-navigates to /take/:id
```

---

## 🏭 Building for Production

### Build the Client

```bash
cd client
npm run build
```

Output is in `client/dist/` — serve with any static host (Vercel, Netlify, etc.)

### Build the Server

```bash
cd server
npm run build
```

Output is in `server/dist/`. Run with:

```bash
node dist/index.js
```

---

## 🔀 Git Workflow

```bash
# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "feat: your feature description"

# Push to GitHub
git push origin main
```

---

## 📄 License

© 2026 Quizzy. All rights reserved By veduu.
=======

>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
