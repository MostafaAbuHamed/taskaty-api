# Taskaty API — Development Plan

> **What this is:** a build-to-learn plan for a task management REST API written in **raw Node.js —
> zero frameworks, zero npm dependencies**. The API is the deliverable; understanding what Express
> does for you is the point.
>
> **Format:** session-based. No dates. A "week bucket" = ~7–10 focused hours, however you spread
> them. Pick the next unchecked session, do it, check it off.
>
> **Honest size:** ~35–45 focused hours ≈ 5–6 week buckets at your real pace.
>
> **Rewritten 2026-09-07** against the verified state of the code, replacing the original agent-run
> plan. This file is now the **single tracker** for this project — if your Obsidian reality plan and
> this file disagree, this file wins. Point the Obsidian note here instead of duplicating checkboxes.

---

## 1. Why this project exists

You are going to build, by hand, the things Express hands you for free: a router with path
parameters, a middleware chain, a body parser, a centralized error handler, a layered architecture.

That is the entire value. **Every hour spent here is repaid with interest in the next project.** When
Express's `app.use()` ordering bites you, or `req.body` is `undefined` because you forgot
`express.json()`, you will not be guessing — you will have written the thing that does it.

So the sequencing is deliberate: **Taskaty first, then the commerce platform, then Slot.** This is the
one where you learn what the framework is hiding.

**The rule that makes this work:** you write every line. Use AI to explain a concept, review what you
wrote, or unstick you after 45 minutes — never to produce the code. If it types the Router, you
learned nothing about routers, and Slot's Phase 1 will be a wall instead of a recap.

### Deliberately not in this project

Unchanged from the original plan, and still correct:

- No third-party npm packages. Zero production dependencies.
- No authentication or authorization.
- No database — JSON files on disk.
- No frontend, no Docker, no CI/CD, no deployment.

Those all come later, in projects designed to teach them. Adding one here trades the thing this
project is uniquely good at for something the next project does better.

---

## 2. The architecture

The same layering you will meet again in every project after this one:

```
request → server.js → app.js → Router → middleware chain
                                            ↓
                                       controller     ← HTTP in, HTTP out
                                            ↓
                                        service       ← business rules, no HTTP
                                            ↓
                                      repository      ← JSON file persistence
```

```
taskaty-api/
├── server.js               # entry point: http.createServer, listen, graceful shutdown
├── app.js                  # request handler: middleware chain + routing
├── Errors/
│   └── AppError.js         # error base class
├── src/
│   ├── controllers/        # (Wave 5) translate HTTP ↔ plain objects
│   ├── services/           # (Wave 5) business rules. No req/res. Ever.
│   ├── repositories/       # (Wave 2) read/write JSON files
│   ├── middleware/         # (Wave 3) body parser, logger, CORS
│   ├── models/             # Task, Category, Tag constructors
│   ├── utils/              # Router, idGenerator, constants, fileHelper
│   └── data/               # tasks.json, categories.json, tags.json
└── test/                   # (Wave 1) node:test, no framework
```

**The three rules:**

1. **Dependencies point one way:** controller → service → repository. A repository never calls a service.
2. **Services never see `req` or `res`.** A service takes plain arguments and returns plain data or throws an `AppError`. *Test: could a CLI script call this service unchanged? If no, the layering is broken.*
3. **`server.js` is separate from `app.js`.** `app.js` exports a request handler; `server.js` binds the port. This is what lets tests exercise the app without opening a socket — and it is exactly the split Express projects use.

### Fixed decisions

| Decision | Value | Why |
|---|---|---|
| Module system | CommonJS (`require`) | Matches the course. ESM comes in the TypeScript projects. |
| IDs | `crypto.randomUUID()` via `src/utils/idGenerator.js` | Collision-safe, built in. One wrapper so the strategy lives in one place. |
| Tests | `node:test` + `node:assert` | Built into Node. Zero dependencies, as promised. |
| Port | `process.env.PORT \|\| 3000` | Config through the environment, not hardcoded. |
| API prefix | `/api/v1/` | Versioned from day one — costs nothing now, impossible to retrofit later. |
| Response envelope | `{ success, data }` / `{ success, error: { status, message } }` | One shape everywhere. Decided once, never re-litigated. |
| Persistence | JSON files, atomic writes | Write-to-temp-then-rename. Teaches durability without a database. |

---

## 3. The design-principles thread

Named at the moment the code makes you need them, not upfront:

| Principle | Where it shows up | Wave |
|---|---|---|
| **SRP** | The controller/service/repository split. Three reasons to change, three files. | W5 |
| **DIP** | The service depends on a repository it is *given*, not one it `require`s directly. Do this and swapping JSON files for a database later touches one file. | W5 |
| **OCP** | The middleware chain: add behaviour by adding a function, without editing the ones already there. | W3 |
| **DRY, and the rule of three** | Category and Tag CRUD are nearly identical. **Write both fully before abstracting anything.** Duplicate twice, abstract on the third. | W5 |
| **Make illegal states unrepresentable** | Status and priority come from `constants.js`, never from a raw string at a call site. | W6 |

---

# THE WAVES

---

## Wave 0 — Stabilize ✅ **DONE 2026-09-07**

The project did not run. It does now. Completed as a repair pass, not as learning work:

- [x] **Restored `src/utils/idGenerator.js`.** It had been deleted while `category.model.js` and `tag.model.js` still imported it — both threw `MODULE_NOT_FOUND`. It is back as a one-line wrapper over `crypto.randomUUID()`.
- [x] **Repointed `task.model.js`** at the same helper instead of calling `crypto.randomUUID()` inline, so all three models generate IDs the same way.
- [x] **Created `app.js` and `server.js`.** `npm start` failed entirely — the script pointed at a file that did not exist. The server now listens on `PORT || 3000`, answers every path with the 404 envelope, and shuts down gracefully on SIGINT/SIGTERM.
- [x] **Tidied `Errors/AppError.js`** (stray empty block).
- [x] **Un-ignored this file.** `DevelopmentPlan.md` was in `.gitignore`, so the plan existed in exactly one place with no backup.

> **Worth reading before Wave 1:** `server.js` and `app.js` were written for you to unbreak the
> project. That makes them the one place here you did not author. **Delete them and rewrite them from
> memory**, then `git diff`. It takes twenty minutes and it converts someone else's code into yours.

**Verified:** all three models construct, `npm start` serves `{"success":false,"error":{"status":404,"message":"Not Found"}}`, Ctrl+C exits cleanly.

---

## Wave 1 — Foundation: the Router
**~1 week bucket (6–8 h)** · *The single most valuable thing in this project.*

### Ship
A `Router` that matches paths with parameters, and the tests that prove it.

### Sessions
- [ ] **1.1** — Understand the problem before solving it. `/tasks/42` must match a route registered as `/tasks/:id` and hand you `{ id: '42' }`. Your current `match()` does exact string comparison and always returns `params: {}`. Write down, in English, the algorithm that fixes it — before writing any code. (~1h)
- [ ] **1.2** — Regex fundamentals, just enough: character classes, quantifiers, anchors, capture groups, and **named** capture groups (`(?<id>[^/]+)`). Practice in a scratch file until you can write one from memory. (~1.5h)
- [ ] **1.3** — Convert a path pattern to a regex at registration time, not match time. `/tasks/:id` → `^/tasks/(?<id>[^/]+)$`. Store `{ method, pattern, handler }`. Ask yourself why you build it once at registration rather than per request. (~2h)
- [ ] **1.4** — Rewrite `match(method, pathname)` to test the regex and return `{ handler, params }` from the named groups, or `null`. Document the limitations as comments: no optional params, no wildcards, no regex routes. **Known and intentional beats accidental.** (~1.5h)
- [ ] **1.5** — `test/router.test.js` with `node:test` and `node:assert`. At least 5 cases: static match, param extraction, multiple params, method mismatch → `null`, unknown path → `null`. (~1.5h)

### New concepts
Regular expressions and named capture groups · why you precompute at registration instead of per request · the difference between a path *pattern* and a path *value* · `node:test` and `node:assert` · writing a test that fails first · documenting intentional limitations.

### Challenges
- **Does `/tasks/:id` match `/tasks/42/comments`?** It must not. Get your anchors right and add the test that proves it.
- Register two routes that could both match one URL. Which wins? Decide deliberately — first-registered or most-specific — and write the reason in a comment.
- Compare your finished Router to Express's `app.get('/tasks/:id')`. Same idea, more edge cases. You now know which edge cases.

### Checkpoint
`npm test` runs and passes with at least 5 Router tests, and `router.match('GET', '/tasks/42').params.id === '42'`.

---

## Wave 2 — Persistence: atomic JSON files
**~1 week bucket (6–8 h)**

### Ship
A real repository layer that survives a restart — and a crash mid-write.

### Sessions
- [ ] **2.1** — Replace the `fileHelper.js` stub (still marked `TODO: replace after lesson 67` — you are past that lesson) with real `fs.promises` reads and writes. (~1.5h)
- [ ] **2.2** — **Atomic writes.** Write to `data/tasks.json.tmp`, then `fs.rename()` over the original. Understand why: `rename` is atomic on the same filesystem, so a crash mid-write leaves the old file intact instead of a truncated one. (~2h)
- [ ] **2.3** — Prove it. Kill the process mid-write (a big payload plus a `setTimeout` between write and rename) and confirm `tasks.json` is still valid JSON afterwards. Then try it *without* the temp file and watch the corruption. (~1.5h)
- [ ] **2.4** — Build `src/repositories/` — one repository per resource, each exposing `findAll`, `findById`, `create`, `update`, `remove`. No business rules in here. (~2h)
- [ ] **2.5** — Tests against a temp fixture directory, cleaned up between runs. (~1.5h)

### New concepts
`fs.promises` · async I/O and why it isn't blocking the process · atomicity and partial writes · why `rename` is the durable primitive · JSON parse failures as a real error case · repository pattern · test fixtures and cleanup.

### Challenges
- What happens if `tasks.json` contains malformed JSON at startup? Decide: crash loudly, or start empty? Justify it.
- Two writes at once — is that possible in a single-process Node server? Think it through carefully; the answer teaches you something about the event loop.

### Checkpoint
Create a task, kill the server, restart, and read it back. Kill the process mid-write and the data file is still valid.

---

## Wave 3 — The middleware pipeline
**~1 week bucket (7–9 h)** · *This is the wave that makes Express make sense.*

### Ship
A working middleware chain: logger, CORS, JSON body parser, URL/query parsing.

### Sessions
- [ ] **3.1** — Design the chain. An array of `(req, res, next)` functions, run in order, each deciding whether to continue. **This is `app.use()`.** Write it before you look at how Express does it. (~2h)
- [ ] **3.2** — **The body parser.** `req` is a readable stream — collect `data` chunks, concatenate on `end`, `JSON.parse`. This is the single best payoff from the streams lessons in your course. Handle malformed JSON as a 400, not a crash. (~2.5h)
- [ ] **3.3** — URL and query parsing with `new URL(req.url, 'http://localhost')`. Split pathname from query string; the Router matches only the pathname. (~1.5h)
- [ ] **3.4** — A request logger: method, path, status, duration. You will need it for every wave after this. (~1h)
- [ ] **3.5** — CORS headers, and handling the `OPTIONS` preflight. Understand *why* the browser sends a preflight at all. (~1.5h)

### New concepts
The middleware pattern (chain of responsibility) · `next()` and what forgetting it does · streams and backpressure in practice · `Buffer.concat` · why body parsing must be async and routing can be sync · the `URL` API · CORS and preflight requests · order dependence in a pipeline.

### Challenges
- **Forget to call `next()` on purpose.** The request hangs forever, with no error. Sit with that — it is the most common Express bug there is, and now you know exactly why it happens.
- Send a 10MB body. What stops a client exhausting your memory? Add a size limit and reject with 413.
- Put the logger last instead of first. Why is the output useless?

### Checkpoint
`curl -X POST -d '{"title":"test"}' -H 'Content-Type: application/json' localhost:3000/api/v1/tasks` reaches a handler with a parsed `req.body`, and the logger prints one line with the duration.

---

## Wave 4 — Errors
**~0.5 week bucket (4–5 h)**

### Ship
An error hierarchy and one centralized handler. Zero try/catch in any route.

### Sessions
- [ ] **4.1** — Move `Errors/AppError.js` to `src/errors/` for consistency with the rest of the tree, and build the hierarchy on it: `NotFoundError` (404), `ValidationError` (400), `ConflictError` (409). Each sets its own `httpCode`. (~1.5h)
- [ ] **4.2** — Operational vs programmer errors — the `isOperational` flag already in your `AppError`. A 4xx you report to the client; a 5xx you log and hide. **Never leak a stack trace in a response.** (~1h)
- [ ] **4.3** — The centralized handler at the end of the chain. One error shape everywhere: `{ success: false, error: { status, message } }`. (~1.5h)
- [ ] **4.4** — Async errors: your handlers are `async`, so a rejected promise must reach the handler. Node will not do this for you. (~1h)

### New concepts
Error subclassing and `Error.captureStackTrace` · error taxonomy · centralized handling as a cross-cutting concern · unhandled promise rejections · why the error handler goes last.

### Challenges
- **Compare notes with Express.** Express's error middleware is the 4-argument `(err, req, res, next)` signature, and Express 5 auto-forwards rejected promises while Express 4 does not. You are building the thing that behaviour describes — write down the comparison. It will be worth a lot in the next project.
- Throw a `NotFoundError` from three layers deep and confirm it becomes a clean 404 with no try/catch on the way up.

### Checkpoint
A deliberate `throw new NotFoundError('Task not found')` inside a service produces a 404 with the standard envelope, and no route file contains a try/catch.

---

## Wave 5 — Category & Tag CRUD
**~1 week bucket (7–9 h)** · *Your first full vertical slice.*

### Ship
Complete CRUD for Categories and Tags, through all four layers, with validation.

### Sessions
- [ ] **5.1** — Build one slice end to end: route → controller → service → repository, for `GET /api/v1/categories`. Small, but every layer. (~2h)
- [ ] **5.2** — Complete Category CRUD: create, read one, read all, update, delete. Correct status codes — 201 on create, 204 on delete, 404 on missing. (~2.5h)
- [ ] **5.3** — Validation in the **service**, not the controller. Required fields, types, lengths. Throw `ValidationError`. Ask why the service and not the controller. (~1.5h)
- [ ] **5.4** — **Now do Tags.** It will feel like copy-paste. **Resist abstracting.** Write it out fully. (~1.5h)
- [ ] **5.5** — With both written, decide: is there a real abstraction here, or two things that merely look alike? Either answer is fine — write the reasoning down. (~1h)

### New concepts
Vertical slice development · REST resource naming and status code semantics · where validation belongs · dependency injection by hand (passing the repository into the service) · the rule of three · idempotency of DELETE.

### Challenges
- **DIP in practice:** construct the service with its repository passed in, rather than `require`-ing it inside. Then write a service test with a fake repository and no filesystem at all. That test is your proof the layering is real.
- Delete a category that tasks still reference. What should happen? Decide, document, implement.

### Checkpoint
All 10 endpoints work by `curl`, service tests run with a fake repository and touch no files, and you can say why validation lives where it does.

---

## Wave 6 — Task CRUD
**~1 week bucket (6–8 h)**

### Ship
Full Task CRUD, with the richer validation a Task needs.

### Sessions
- [ ] **6.1** — Task routes, controller, service, repository — you have the pattern now; this should be fast. (~2h)
- [ ] **6.2** — Validate against `constants.js`: `status` and `priority` must be one of the known values, never a free string. (~1.5h)
- [ ] **6.3** — Relationships: `categoryId` must reference a real category; `tags` must all exist. Referential integrity by hand — the thing a real database does for you with a foreign key. (~2h)
- [ ] **6.4** — `dueDate` and `updatedAt`: ISO-8601, UTC, and validating a date string that might be nonsense. (~1.5h)

### New concepts
Cross-resource validation · referential integrity without a database · enum validation · date handling and ISO-8601 · partial updates (PATCH vs PUT — pick one and justify it).

### Challenges
- Point `categoryId` at a category that does not exist. It must fail with a clear 400, not a silent success.
- You are enforcing by hand what a foreign key does automatically. Write down what you are doing manually — that list is exactly what a relational database buys you, and it is the argument for using one in the next project.

### Checkpoint
A task cannot be created with an invalid status, an unknown category, or a malformed date — and each failure names the offending field.

---

## Wave 7 — Query features
**~1 week bucket (6–8 h)**

### Ship
`GET /api/v1/tasks?status=todo&priority=high&sort=-dueDate&page=2&limit=10`

### Sessions
- [ ] **7.1** — Filtering: parse query params, apply predicates, compose several filters safely. (~2h)
- [ ] **7.2** — Sorting, including the `-field` descending convention. Whitelist sortable fields — never sort by an arbitrary client-supplied key. (~1.5h)
- [ ] **7.3** — Pagination with `page`/`limit`, returning `{ items, pageInfo }` with total count. Cap `limit`. (~2h)
- [ ] **7.4** — Compose all three in one request, in the right order: filter → sort → paginate. Order matters; know why. (~1.5h)

### New concepts
Query string parsing and coercion (everything arrives as a string) · predicate composition · stable sorting · offset pagination and its weaknesses · whitelisting as a security practice · why filter-then-sort-then-paginate is the only correct order.

### Challenges
- `?limit=999999`. What stops it? Cap it and say why the cap exists.
- `?sort=constructor` or `?sort=__proto__`. What does your code do? This is why you whitelist.
- You are doing in JavaScript what `WHERE`, `ORDER BY`, and `LIMIT` do in SQL. Note how much slower it gets as the file grows — that is the motivation for the database in the next project.

### Checkpoint
All three combine correctly, invalid params produce clear 400s, and `limit` is capped.

---

## Wave 8 — Portfolio polish
**~0.5 week bucket (4–6 h)**

### Ship
A repository someone else can clone, run, and understand in five minutes.

### Sessions
- [ ] **8.1** — `README.md`: what it is, why raw Node, how to run it, and full endpoint documentation with example requests and responses. (~2h)
- [ ] **8.2** — `api.http` covering every endpoint, so a reviewer can click through it. (~1h)
- [ ] **8.3** — A seed script producing realistic demo data. (~1h)
- [ ] **8.4** — Tidy the git history and tag `v1.0.0`. (~1h)
- [ ] **8.5** — Write `DECISIONS.md`: 5–10 entries, three lines each — what you chose, why, what you rejected. The Router's limitations, offset vs cursor pagination, validation placement, atomic writes. **This is the file a technical reviewer reads most closely.** (~1h)

### Challenges
- Have someone clone it and follow the README with no help. Every place they get stuck is a README bug.
- The README must answer "why no Express?" in one convincing paragraph. That paragraph is the whole pitch of this project.

### Checkpoint
A stranger clones, runs `npm start`, and exercises every endpoint from the README alone.

---

## 4. How to not fail this plan

1. **You write every line.** AI explains, reviews, and unsticks — it does not produce. This is the only project where that rule is absolute.
2. **A wave is not done until its checkpoint passes.** No "I'll add the tests later."
3. **Commit per session**, conventional messages. The git history is part of the deliverable.
4. **This file is the tracker.** Check boxes here. Do not maintain a second list somewhere else.
5. **When stuck for 45 minutes, write the exact question down** before searching. Half the time you will answer it yourself while writing.
6. **Keep noticing what Express would have done for you.** That running comparison is the real output of this project — more than the API itself.

## 5. What you will be able to answer afterwards

- What does `app.use()` actually do, and why does order matter?
- How does `/tasks/:id` become `req.params.id`?
- Why is `req.body` undefined without a body parser?
- What is a middleware chain, and what happens if you forget `next()`?
- Why does a partial file write corrupt data, and how does an atomic rename prevent it?
- Why should business logic not live in the controller?
- What does a relational database do for me that I had to do by hand here?

Those seven answers are what make the next two projects fast instead of confusing.
