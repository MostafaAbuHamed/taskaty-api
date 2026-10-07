# Taskaty-API

![Status](https://img.shields.io/badge/status-in%20progress-yellow)
![Node](https://img.shields.io/badge/node-%3E%3D20-green)

A personal task management REST API built with **raw Node.js: no frameworks**. Tasks are organized by priority, category, tags and due date.

The goal of the project is to learn how HTTP servers work underneath: routing, request parsing, file-based persistence and testing, without Express hiding the details.

> **Status:** work in progress. The data models, enums and router core are in place. The HTTP server, CRUD endpoints and file persistence are still being built (see the roadmap).

## Tech stack

- Node.js (CommonJS), built-in `http`, `crypto`, `fs` modules only
- Built-in test runner (`node --test`)
- No runtime dependencies

## Data model

**Task**

| Field | Type | Default |
| ----- | ---- | ------- |
| `id` | UUID | generated with `crypto.randomUUID()` |
| `title` | string | required |
| `description` | string | required |
| `dueDate` | string or null | `null` |
| `status` | `todo` / `in-progress` / `done` | `todo` |
| `priority` | `low` / `medium` / `high` | `low` |
| `categoryId` | string | `""` |
| `tags` | array | `[]` |
| `estimatedHours` | number | `0` |
| `createdAt` | ISO timestamp | creation time |
| `updatedAt` | ISO timestamp or null | `null` |

**Category** has an `id`, a `name` and `createdAt`. **Tag** is a small label model used to group tasks.

## Project structure

```
src/
  data/       JSON data stores (tasks, categories, tags)
  models/     Task, Category and Tag constructors
  utils/
    Router.js       minimal router (GET, POST, PUT, DELETE, exact-path matching)
    constants.js    STATUS and PRIORITY enums
    fileHelper.js   storage helper (currently an in-memory stub)
```

## Getting started

Requires Node.js 20 or newer.

```bash
git clone https://github.com/MostafaAbuHamed/taskaty-api.git
cd taskaty-api
npm run dev     # node --watch server.js (once the server entry point lands)
npm test        # node --test
```

## Roadmap

- [x] Task, Category and Tag models
- [x] Status and priority enums
- [x] Minimal router with method and path matching
- [ ] HTTP server entry point (`server.js`)
- [ ] CRUD endpoints for tasks, categories and tags
- [ ] File-based persistence in `fileHelper.js` (replace the in-memory stub)
- [ ] Filtering by priority, status, category and tag
- [ ] Input validation and consistent error responses
- [ ] Tests with the built-in Node test runner

## Author

Mostafa Abu-Hamed. [GitHub](https://github.com/MostafaAbuHamed) · [LinkedIn](https://linkedin.com/in/mostafa-abuhamed)
