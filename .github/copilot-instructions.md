# Copilot / AI helper instructions — Score-Sync

These instructions orient an AI coding assistant to the repository layout, conventions, and quick commands so edits are safe and productive.

1. Big picture
   - This is a small MERN app (MongoDB, Express, React, Node).
   - Frontend: `frontend/` (Create React App). Entry: `frontend/src/App.js` and `frontend/src/Home.js`.
   - Backend: `backend/` (Express + Mongoose). Main: `backend/server.js`. Routes live in `backend/routes/` and models in `backend/models/`.
   - The root `package.json` uses `concurrently` to start both services locally (`npm start`).

2. How the app communicates
   - Frontend requests: the UI calls the backend endpoints directly (examples in `frontend/src/App.js`):
     - POST `http://localhost:5050/api/auth/login` and `.../register`
     - (Intended) GET `http://localhost:5050/api/students/:id/grades`
   - Backend health-check: GET `/api/health` (see `backend/server.js`).

3. Key files & data shapes to reference when changing behavior
   - `backend/models/User.js` — User schema: { email, password }
   - `backend/models/Grade.js` — Grade schema: { studentId, course, assignment, score, maxScore, date }
   - `backend/routes/auth.js` — Register/login routes (uses Mongoose model `User`).
   - `backend/routes/grades.js` — Grades route (currently CommonJS; returns grades by student id).

4. Project-specific conventions & pitfalls
   - Mixed module systems: `backend/package.json` sets "type": "module", but some files use CommonJS (`require/module.exports`) (for example: `backend/routes/grades.js` and `backend/models/Grade.js`). Prefer to keep changes consistent with the file being edited: if converting, update related imports/exports and run the app locally to verify.
   - `backend/server.js` currently imports `authRoutes` but registers `studentRoutes` (undefined). This appears to be an existing bug — avoid changing unrelated behavior unless fixing (and test locally after fix).
   - CORS in `backend/server.js` allows `http://localhost:3000`. Frontend `package.json` sets a proxy to `http://localhost:5050` but the frontend code uses absolute URLs. When editing frontend API calls, prefer relative paths (e.g., `/api/auth/login`) to leverage proxy in development, unless you intentionally hardcode URLs.

5. Build / run / debug commands (local dev)
   - Install deps for both: From repository root: `npm run install-all` (runs install in `backend` and `frontend`).
   - Start both: From repository root: `npm start` (runs `concurrently`).
   - Backend only (recommended for quick server debugging):
       - `cd backend; npm run dev` (uses `nodemon`)
   - Frontend only:
       - `cd frontend; npm start`
   - Health check: GET `http://localhost:5050/api/health` (quick smoke test).

6. Editing guidance for AI agents
   - Small, focused changes: Prefer minimal diffs. Run the backend (`npm run dev`) after backend edits and confirm `✅ MongoDB connected` (if MONGO_URI set) or the health endpoint succeeds.
   - Module system fixes: If you convert a file from CommonJS to ESM (or vice versa), update all imports/exports in the same module group (routes/models) and test; note `backend/package.json` expects ESM.
   - Error handling and security: Keep existing error responses and status codes consistent with current routes (401/400/500 patterns used in `backend/routes/auth.js`). Don't introduce authentication or encryption changes without tests and a migration plan.
   - Use examples: When adding or modifying endpoints, mirror existing shapes. E.g., auth responses return JSON { message: string }.

7. When adding tests or scripts
   - Frontend uses CRA test tooling. Add jest/react-testing-library tests under `frontend/src` matching existing patterns.
   - Keep `package.json` scripts small — use existing scripts names (`start`, `dev`, `build`, `test`).

8. Where to look for context
   - Start with these files: `backend/server.js`, `backend/routes/auth.js`, `backend/routes/grades.js`, `backend/models/User.js`, `backend/models/Grade.js`, `frontend/src/App.js`, `frontend/src/Home.js`, root `README.md` and package.json files.

If anything here is unclear or you want me to expand an area (for example: refactoring the backend to consistent ESM, or fixing the missing `studentRoutes` import), tell me which part to expand and I will update this file accordingly.
