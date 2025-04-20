# Film Catalog Application

Application built with Angular 16.2.0 and Angular Universal for server-side rendering (SSR), featuring an in-memory Express API, PrimeNG UI components, and PrimeFlex CSS utilities. This app allows you to manage a catalog of films with full CRUD operations, search, filtering, sorting, and a responsive list view.

---

## Features

- **Server-Side Rendering** with Angular Universal (Express)
- **In-Memory Backend API**
  - `GET /api/films` (with query-based filtering, search, and sorting)
  - `POST /api/films` (create)
  - `PUT /api/films/:id` (update)
  - `DELETE /api/films/:id` (delete)
- **Responsive List View**
  - Displays film cards with image, title, genre, year, director, actors, annotation
  - Action menu (⋮) per card: Edit / Delete
- **Modal Dialog** for adding and editing films (PrimeNG `p-dialog` + Reactive Forms)
- **Search** by title, director, actors, annotation (case-insensitive, min 3 chars)
- **Filtering** by genre, year, date added, date updated
- **Sorting** by title (A→Z, Z→A) and year (asc/desc)
- **Reset** button to clear search, filters, and sorting
- **Responsive Layout** using PrimeFlex grid and components

---

## Tech Stack

- **Frontend:** Angular 16.2.0, PrimeNG, PrimeIcons, PrimeFlex, Reactive Forms
- **SSR / Backend:** Angular Universal (Express), Node.js
- **Styling:** SCSS, PrimeFlex utilities

---

## Prerequisites

- [Node.js](https://nodejs.org/) ≥ 16
- [npm](https://www.npmjs.com/) ≥ 8

---

## Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd film-catalog

# Install dependencies
npm install
```

### Development

- **Frontend only** (SPA + live-reload, proxy for API):
  ```bash
  npm run dev:client
  ```
  Opens at `http://localhost:4200`, proxies `/api` to `http://localhost:4000`.

- **Backend only** (SSR build + in-memory API + hot-reload):
  ```bash
  npm run dev:server
  ```
  Listens on `http://0.0.0.0:4000` with auto rebuild on changes.

- **Full stack** (Frontend + Backend concurrently):
  ```bash
  npm run start:dev
  ```

### Production / SSR

```bash
# Build both browser and server bundles
npm run build:ssr

# Serve the SSR app (Node.js)
npm run serve:ssr
```

Access the application and API at `http://localhost:4000`.

---

## API Documentation

Base URL: `/api/films`

### GET /api/films

Query parameters (all optional):
- `search` (string, ≥ 3 chars)
- `genre` (string)
- `year` (number)
- `addedFrom`, `addedTo` (ISO date strings)
- `updatedFrom`, `updatedTo` (ISO date strings)
- `sortField` (`title` \| `year`)
- `sortOrder` (`asc` \| `desc`)

Returns JSON array of films matching filters + search + sorted.

### POST /api/films

Create a new film. Body JSON:
```json
{
  "title": "string",
  "genre": "string",
  "year": 2021,
  "director": "string",
  "actors": ["actor1", "actor2"],
  "annotation": "string",
  "image": "https://..."
}
```

### PUT /api/films/:id

Update existing film fields. Body JSON same as POST (all fields optional).

### DELETE /api/films/:id

Delete a film by ID.

---

## Project Structure

```
film-catalog/
├── dist/                   # Build output
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── film-list/
│   │   │   └── film-form/
│   │   ├── models/
│   │   │   └── film.model.ts
│   │   ├── services/
│   │   │   └── film.service.ts
│   │   ├── app.module.ts
│   │   ├── app.server.module.ts
│   │   └── tokens/
│   │       └── base-url.token.ts
│   ├── main.ts
│   ├── main.server.ts
│   └── server.ts           # Express + API + SSR setup
├── proxy.conf.json         # API proxy for ng serve
├── angular.json
├── package.json
└── README.md               # ← this file
```

---

## Notes

- Data is stored **in-memory**; restart the server to reset.
- For production, replace in-memory storage with a real database (e.g., MongoDB, PostgreSQL).


