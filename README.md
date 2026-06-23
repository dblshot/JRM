# Junior Marketeer (dbl_shot_jm)

A **gamified e-learning portal** for teaching marketing to "Junior Marketeers" (deployed at `portal.dblshot.co`).

Students watch video lessons, view slides, take timed quizzes with a score-doubling time bonus, submit assignments, and compete on a leaderboard. Admins manage users, lessons, quizzes, and assignments, and grade submissions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 6, React Router 7 |
| UI | Material UI (MUI 7), Tailwind CSS 4, Framer Motion, SweetAlert2, react-confetti |
| Backend | Node.js, Express 5, Mongoose 8 |
| Database | MongoDB (Atlas via `MONGODB_URI`) |
| Auth | JWT (`jsonwebtoken`), 6h expiry |
| File storage | Cloudinary (unsigned upload preset) |
| Media embed | YouTube + Google Drive iframes |
| Deploy | Vercel (frontend, SPA rewrites); backend hosted separately |

---

## Project Structure

```
dbl_shot_jm-main/
├── client/                      # React + Vite frontend
│   ├── public/                  # logo.png, white_logo.png (+ originals)
│   ├── src/
│   │   ├── assets/svg/          # decorative svgs (rocket, bulb, speaker, tactics, charts...)
│   │   ├── components/          # reusable UI (forms, lists, viewers, leaderboard)
│   │   ├── hooks/               # custom data-fetching hooks
│   │   ├── pages/               # route-level pages
│   │   ├── styles/              # sweetalert2 theme override
│   │   ├── App.jsx              # Router + route definitions
│   │   ├── main.jsx             # React root
│   │   ├── index.css            # Tailwind import + scrollbar/filter styles
│   │   └── pdf-worker.js        # react-pdf worker setup
│   ├── .env                     # VITE_API_BASE_URL
│   ├── index.html
│   ├── vite.config.js           # react + tailwind plugins, dev proxy
│   ├── vercel.json              # SPA rewrite (all → /)
│   └── package.json
│
└── server/                      # Express + Mongoose backend
    ├── schemas/                 # Mongoose models (User, Lesson, Test/Quiz, Assignment)
    ├── routes/                  # user, lesson, test, assignment routes
    ├── .env                     # MONGODB_URI, JWT_SECRET, PORT
    ├── index.js                 # Express entry (CORS, routes, DB connect)
    └── package.json
```

---

## Data Models

### User
```js
{
  username:    String (required, unique),
  displayName: String (required),
  password:    String (required),        // ⚠️ currently stored in PLAINTEXT
  score:       Number (default 0),       // total accumulated points
  admin:       Boolean (default false),
  completedTests: [{
    testId, lessonId,                    // ObjectId refs
    score: Number,
    userAnswers: [{ questionIndex, selectedAnswer }],
    timeTaken: Number,
    timeBonusApplied: Boolean
  }],
  completedAssignments: [{
    assignmentId,                        // ObjectId ref
    uploadedAt: Date (default now),
    fileUrl: String (required),          // Cloudinary URL
    graded: Boolean (default false),
    grade: Number
  }]
}
```

### Lesson
```js
{ title (required), videoLink, slidesLink, notes (default '') }
```

### Quiz (model `Quiz`, file `Test.js`)
```js
{
  lessonId: ObjectId ref Lesson (required),
  timeLimit: Number (default 120, seconds),
  questions: [{
    text (required),
    choices: [String],
    correctAnswer: Number,               // index of correct choice
    difficulty: 'easy' | 'medium' | 'hard' (default 'easy'),
    basePoints: Number (default 5)
  }]
}
```

### Assignment
```js
{ title, description, dueDate, points, lessonId }  // all required
```

---

## API Reference

Base URL is configured via `VITE_API_BASE_URL`. Mounted prefixes: `/user`, `/lessons`, `/tests`, `/assignments`.

### Users — `/user`
| Method | Path | Purpose |
|---|---|---|
| POST | `/register` | Create user (`username`, `password`, `displayName`, `admin`) |
| GET | `/` | List all users (incl. password + score + completedTests) |
| POST | `/login` | Validate creds, return JWT + `{ username, admin, _id }` |
| POST | `/:userId/complete-assignment` | Push assignment submission (`assignmentId`, `fileUrl`) |
| GET | `/:userId` | Get single user (refresh client localStorage) |

### Lessons — `/lessons`
`POST /` · `GET /` · `PUT /:id` · `DELETE /:id`

### Tests — `/tests`
| Method | Path | Purpose |
|---|---|---|
| POST | `/` | Create quiz (validates lesson + question shape) |
| GET | `/` | List quizzes (populates lesson title) |
| GET | `/:id` | Get quiz for taking — **strips `correctAnswer`** |
| GET | `/lesson/:lessonId` | Quizzes for a lesson |
| GET | `/:testId/completion-status/:userId` | Has user finished? Returns feedback |
| POST | `/:testId/submit` | Grade answers, apply 2× time bonus, save to user |
| PUT | `/:id` | Update quiz |
| DELETE | `/:id` | Delete quiz |

### Assignments — `/assignments`
| Method | Path | Purpose |
|---|---|---|
| POST | `/` | Create assignment |
| GET | `/` | List assignments (populates lesson) |
| GET | `/:id` | Get one assignment |
| PUT | `/:id` | Update assignment |
| DELETE | `/:id` | Delete assignment |
| GET | `/:id/submissions` | All student submissions for an assignment |
| POST | `/:assignmentId/grade/:userId` | Set grade + add points to user score |

---

## Frontend Routes (`App.jsx`)

| Path | Page | Role |
|---|---|---|
| `/` | `Login` | public |
| `/welcome` | `Welcome` | student (lesson sidebar) |
| `/admin` | `Admin` | admin dashboard |
| `/admin/tests` | `TestEditPage` | admin |
| `/admin/assignments` | `AssignmentEditPage` | admin |
| `/video` | `VideoPage` | YouTube/Drive embed |
| `/pdf` | `PDFPage` | Google Drive slides embed |
| `/test/:testId` | `TestTakingPage` | timed quiz |
| `/assignment` | `AssignmentPage` | upload submission |
| `/leaderboard` | `LeaderboardPage` | ranking |

**Auth pattern:** there is no protected-route wrapper. Each page reads `localStorage.user` in a `useEffect` and redirects if missing/wrong role. The JWT is stored but not sent on subsequent requests, so backend routes are effectively unprotected (see *Known Issues*).

---

## Custom Hooks (`client/src/hooks/`)

All read `import.meta.env.VITE_API_BASE_URL` and return a `{ data, loading, error, refetch }`-style shape:

`useLogin`, `useAllUsers`, `useCreateUser`, `useAllLessons`, `useAllTests`, `useTestsByLesson`, `useTestCompletion`, `useAllAssignments` (+ `getAssignmentForLesson` helper), `useAssignmentSubmissions`.

---

## Key Business Logic

1. **Quiz scoring** — each correct answer earns `basePoints`. If `timeTaken <= timeLimit`, the **entire score is doubled** (`timeBonusApplied`). One attempt only; resubmission is blocked server-side.
2. **Quiz security** — `GET /tests/:id` returns questions *without* `correctAnswer`; grading happens server-side on submit.
3. **Leaderboard** — driven by `user.score`, which accumulates from quiz scores + assignment grades.
4. **Assignments** — files upload directly from the browser to Cloudinary (`cloud_name: dwevw1bm1`, unsigned preset `student_uploads`); the secure URL is then saved to the user. Single submission enforced in the UI.
5. **Media** — video links are parsed for a YouTube ID or Google Drive ID and embedded in an iframe; slides use the Google Drive `/preview` iframe.
6. **Theme** — dark navy gradient (`#0a1833` → `#02050a`) with an orange accent (`#ffaf1b`), Baloo 2 font, animated decorative SVGs (Framer Motion), and confetti on quiz success.

---

## Environment Variables

**`client/.env`**
```
VITE_API_BASE_URL=<backend base url>     # e.g. http://localhost:5000
```

**`server/.env`**
```
MONGODB_URI=<mongodb atlas connection string>
JWT_SECRET=<jwt signing secret>
PORT=5000
```

CORS allow-list is hardcoded in `server/index.js`: `https://portal.dblshot.co`, `http://localhost:5173`.

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- A MongoDB database (local or Atlas)
- A Cloudinary account with an unsigned upload preset (for assignment uploads)

### 1. Backend
```bash
cd server
npm install
# create server/.env with MONGODB_URI, JWT_SECRET, PORT
npm run dev        # nodemon index.js  → http://localhost:5000
```

### 2. Frontend
```bash
cd client
npm install
# create client/.env with VITE_API_BASE_URL=http://localhost:5000
npm run dev        # vite → http://localhost:5173
```

### 3. Create an admin user
There is no seed script. Register a user via the API, then flip `admin: true`:
```bash
curl -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"changeme","displayName":"Admin","admin":true}'
```

---

## Build & Deploy

**Frontend (Vercel):**
```bash
cd client
npm run build      # outputs dist/
```
`vercel.json` rewrites all routes to `/` for client-side routing.

**Backend:** `npm start` (`node index.js`) on any Node host. Set the production env vars and add the frontend origin to the CORS allow-list in `server/index.js`.

---

## Known Issues / Hardening TODO

These are real weaknesses in the current codebase, worth fixing:

- **Passwords are stored in plaintext** and returned by `GET /user`. Hash with bcrypt and never expose them.
- **JWT is issued but never enforced** — no auth middleware on any route, so admin endpoints can be called directly. Add middleware that verifies the token and checks `admin`.
- **Login compares the password directly in a Mongo query** (`findOne({ username, password })`), which only works because passwords are plaintext.
- **Cloudinary credentials are hardcoded** in `client/src/pages/AssignmentPage.jsx`. Move to env vars.
- **CORS origins are hardcoded** rather than env-driven.
- **No protected-route wrapper** — auth is client-side only and trivially bypassed.
- `client/README.md` is the default Vite template (this root README supersedes it).
