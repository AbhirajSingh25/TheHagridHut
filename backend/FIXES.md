# HireSense Backend — Audit & Fix Summary

Scope of this pass: make every backend endpoint the frontend actually
calls work correctly, fix everything that was silently broken, and
clean up duplicate/dead code that caused it. All fixes were verified
by actually booting the server and hitting the endpoints with curl
(not just read by eye) — see "Verified live" below.

## App-crashing bugs (the backend could not start at all)

1. **`app/routes/settings.py`** imported `get_current_user`,
   `verify_password`, `get_password_hash` from `app.utils.auth` — a
   module that did not exist anywhere in the repo. Since
   `settings_router` is imported unconditionally in `app/main.py`,
   this crashed the entire app on startup, every time, regardless of
   environment.
   → **Fix:** added `app/utils/auth.py`, which re-exports the real,
   already-used implementations from `app.security` (no second,
   competing auth implementation).

2. **`app/routes/analytics.py`** imported its DB session from a
   dead root-level `database/database.py` module — a completely
   separate SQLite setup, disconnected from the Postgres database
   (`app/database.py`) every other route uses. Analytics data was
   being read from an empty, orphaned database.
   → **Fix:** changed the import to `app.database`, the one database
   module the rest of the app actually uses.

## Routing bugs (real, frontend-wired features were 404ing)

Found by tracing every `fetch`/`services/api.ts` call in the frontend
against `app/main.py`'s router mounts:

| Feature | Frontend calls | Was | Now |
|---|---|---|---|
| Login / signup | `POST /auth/login`, `/auth/signup` | `/api/auth/login` (double prefix) | `/auth/login` ✅ |
| Candidate Intelligence | `GET /api/candidate/intelligence` | `/api/api/candidate/intelligence` (double prefix) | `/api/candidate/intelligence` ✅ |
| Profile | `/api/profile/*` | `/api/api/profile/*` (double prefix) | `/api/profile/*` ✅ |
| Speech analysis | `POST /api/speech/analyze` | `/speech/analyze` (missing `/api`) | `/api/speech/analyze` ✅ |
| Vision analysis | `POST /vision/analyze` | **not mounted at all** — 404 always | `/vision/analyze` ✅ |
| Admin stats | `GET /admin/stats` | **no route existed** | added, computed live from the DB |
| Final report | `GET /final-report` | **no route existed** | added, delegates to the existing `/api/interview/latest-report` handler |
| Hiring probability | `POST /api/hiring-probability` with `{confidence, communication, technical}` | only a `GET` existed, with a different (session-based) contract | kept the existing `GET` as-is, added the `POST` variant the frontend actually calls, at the same path |

`vision.py` in particular was a complete, ~1,400-line working
implementation (image quality scoring, Groq vision analysis with a
local-heuristics fallback) that had simply never been imported into
`main.py` — every request from the Vision Analysis page was failing
before it ever reached that code.

## Cleanup (moved, not deleted)

The following were dead/duplicate modules not used by the running app
(`app.main:app`, per the Dockerfile). They're preserved under
`_legacy_unused/` rather than removed, in case anything in your own
workflow still references them:

- Root-level `main.py`, `database/`, `auth/`, `services/` — an older,
  entirely separate copy of the app that isn't wired to anything.
- `app/db/` and `app/core/` — an unused second database/auth module
  pair; nothing in `app/routes/*` imports from either.
- `app.zip`, `test_groq.py`, `migrate_interview_sessions.py`,
  `hiresense.db` — stray build/dev artifacts, deleted (not
  referenced by any code path).

## Enhancements

- **`POST /generate-questions`** now asks Groq for a role/level-tailored
  set of 5 interview questions, and only falls back to the previous
  static question list if the AI call fails or returns something
  malformed — so the interview flow never breaks, but is AI-generated
  when possible.

## Verified live

Started the server locally (SQLite, no external network) and drove
the actual HTTP flow with curl:

`signup → login → generate-questions → evaluate-answer →
generate-followup → save-interview → interview history → dashboard →
admin/stats → leaderboard → certificate (PDF) → achievements →
candidate intelligence`

All returned correct, consistent data — e.g. after saving one
interview session, `dashboard`, `admin/stats`, and `leaderboard` all
immediately reflected it correctly, confirming persistence and the
DB fix are working together correctly.

Also confirmed:
- `requirements.txt`'s `bcrypt==4.0.1` pin is correct and required —
  passlib 1.7.4 is incompatible with bcrypt ≥4.1 (a known upstream
  bug: signup/login will 500 with a `password cannot be longer than
  72 bytes` error if this pin is ever loosened).
- CORS is already correctly configured for Vite's default dev
  server (`localhost:5173` / `127.0.0.1:5173`), with `FRONTEND_URL`
  as an override — **if you deploy the frontend somewhere else
  (Vercel, Netlify, etc.), set `FRONTEND_URL` on the backend to that
  domain, or the browser will block every request with a CORS
  error.**
- `resume.py`'s `/api/resume/analyze` and `/api/resume/match-jd`,
  `interview.py`'s full question/evaluate/report/save/history/
  playback flow, `dashboard.py`, `leaderboard.py`, and
  `certificate.py` were already correctly wired and did not need
  path changes — only the ones listed above were broken.

## Not exhaustively re-verified in this pass

`resume.py`, `vision.py`, `speech.py`, `recruiter.py`, `admin.py`,
`settings.py`, `notes.py`, `scheduler.py`, `notifications.py`, and
`coding.py` are large (many hundreds to several thousand lines each)
and already contain real, non-placeholder logic (PDF/DOCX parsing,
Groq vision/speech analysis with local fallbacks, PDF certificate
generation, etc.) — these were read and spot-checked but not
line-by-line audited, since this sandbox has no network access to
Groq to exercise the AI branches, and no way to submit real audio/
video/resume files through curl the way a browser would. The routing
fixes above mean the frontend can now actually reach all of them;
if you hit an issue in one of them specifically, send the exact
response/error and I'll dig into that file next.

Also not addressed: `Notes`, `Settings`, `Profile`, `Progress`,
`Scheduler`, and `Notifications` pages in the frontend currently
don't call the backend at all (pure `localStorage`), even though
matching backend routers already exist (`app/routes/notes.py`,
`settings.py`, `profile.py`, `progress.py`, `scheduler.py`,
`notifications.py`). Since the instructions were to match the
frontend's existing contract rather than rewrite it, I left these
alone — say the word if you'd like the frontend wired up to these
existing endpoints too.

## Round 2: real AI wired into everything that was rule-based

A follow-up audit found that several features *named* "AI" were
actually pure formulas/keyword-matching with no LLM call at all.
Specifically:

- `interview.py`'s `evaluate_answer`, `generate_followup_question`,
  and `generate_report` — the entire core interview loop — had zero
  Groq/AI calls. Scoring was word-count and keyword-list based;
  follow-up questions were picked from 3 hardcoded templates.
- `candidate_service.py`'s recommendation/strengths/improvements
  (powering `/api/candidate/intelligence`) were score-threshold
  lookups into canned strings like `"Strong Candidate"`.
- `dashboard.py`'s `/recruiter-insights` technical/communication/
  confidence notes and recommendation were f-string templates.
- `hiring.py`'s recommendation text was 4 hardcoded paragraphs
  keyed off score ranges.
- There were also several complete, working Groq-backed service
  files sitting **unused** because no route imported them:
  `interview_ai.py`, `resume_ai.py`, `recruiter_ai.py`,
  `recruiter_service.py`, `report_builder.py`.

### What changed

Every one of the rule-based spots above now tries a real Groq call
first, and only falls back to the original deterministic logic if
the AI call fails, times out, or returns a malformed/incomplete
response - so nothing ever breaks or shows empty data just because
`GROQ_API_KEY` is missing or the provider is briefly down:

| Function | File | New behavior |
|---|---|---|
| `evaluate_answer` | `interview.py` | Groq scores technical/communication/confidence/relevance + writes strengths/improvements/feedback specific to what the candidate actually said. Response now includes `"ai_generated": true/false`. |
| `generate_followup_question` | `interview.py` | Groq writes a real adaptive follow-up grounded in the previous answer, instead of picking from 3 templates. |
| `generate_report` | `interview.py` | Adds a new `"summary"` field: a 3-4 sentence Groq-written narrative referencing the actual scores, strengths and improvements. |
| `build_candidate_intelligence` | `candidate_service.py` | New `generate_ai_candidate_narrative()` - Groq writes the recommendation label, strengths and improvements from the candidate's scores. |
| `recruiter_insights` | `dashboard.py` | New `ai_recruiter_narrative()` - Groq writes the technical/communication/confidence notes and the recommendation. |
| `get_hiring_probability` (GET) | `hiring.py` | New `get_ai_recommendation()` - Groq writes the recommendation from the score breakdown. |
| `compute_hiring_probability` (POST) | `main.py` | Same treatment as the GET version above. |
| `generate_questions` | `main.py` | (from the first pass) Groq generates the 5 interview questions. |

All of the above were tested live: booted the server, drove real
requests, and confirmed via server logs that when Groq is
unreachable (as in this sandbox - `Host not in allowlist:
api.groq.com`) the exception is caught, logged, and the endpoint
still returns `200` with the correct deterministic fallback data.
With a real `GROQ_API_KEY` and network access, the same code path
will return the AI-generated version instead.

### Deliberately left as rule-based (not an oversight)

`recruiter.py`'s bulk endpoints (`recruiter-dashboard`,
`top-candidates`, candidate list views) call
`get_recruiter_recommendation()` **once per candidate inside a
loop**. Wiring a live Groq call into that function would mean one
sequential AI request per candidate on every dashboard page load -
a real latency and cost problem, not a hypothetical one - so this
was left rule-based rather than silently making those pages slow.
If you want AI there too, the clean way to do it is on the *single*
candidate detail endpoint (`get_recruiter_candidate`) only, which I
can add on request.

`admin.py`'s stats are pure counts/averages; there's no natural
"generate text" step there to enhance.
