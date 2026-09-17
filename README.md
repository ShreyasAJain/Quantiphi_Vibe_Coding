# Kanban Task Management with Server-Side Workload Balancing

A full-stack Kanban board web application with relational data modeling, server-side workload balancing, optimistic drag-and-drop updates, and multi-workspace support.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, `@hello-pangea/dnd`, Lucide Icons
- **Backend**: Node.js, Express 5, TypeScript, Zod, CORS
- **Database & ORM**: PostgreSQL 16, Prisma ORM
- **Infrastructure**: Docker & Docker Compose

---

## ⚙️ Architecture & Core Features

### 1. Server-Side Workload Balancing Rule
- Evaluates active tasks assigned to each project team member.
- **Strict Capacity Rule**:
  - **$\le 5$ In-Progress tasks**: Normal / At Capacity (`isOverloaded = false`).
  - **$> 5$ In-Progress tasks**: Overloaded warning (`isOverloaded = true`).
- Evaluated on the backend via `WorkloadService` and aggregated via `/api/projects/:id/board`.

### 2. Kanban Board Engine
- 3 status columns: `To-Do`, `In Progress`, `Done`.
- Drag-and-drop card movement powered by `@hello-pangea/dnd`.
- **Optimistic UI Updates**: Cards move instantly with automatic database synchronization and rollback on error.
- Live column counters synced with PostgreSQL.

### 3. Task Lifecycle Management
- Interactive task creation modal with dynamic project member assignment, priority indicators (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and due date scheduling.
- Click-to-inspect task cards with full editing and atomic task deletion.

### 4. Multi-Workspace & Team Provisioning
- Project creation modal for switching between isolated workspaces.
- Team member manager: Add existing users to projects or provision new team members dynamically with `OWNER` or `MEMBER` roles.

### 5. Multi-Dimensional Search & Filters
- Real-time keyword search across task titles and descriptions.
- Filter by priority and specific assignee with live matching counter.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- npm

### 1. Start PostgreSQL Database
```bash
docker compose up -d
```

### 2. Setup & Start Backend Server
```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```
*Backend runs on `http://localhost:5000`.*

### 3. Setup & Start Frontend Client
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health and database latency check |
| `GET` / `POST` | `/api/users` | User management |
| `GET` / `POST` | `/api/projects` | Project workspace management |
| `GET` / `POST` | `/api/projects/:id/members` | Project team membership |
| `GET` / `POST` | `/api/projects/:id/tasks` | Task creation and query |
| `GET` / `PATCH` / `DELETE` | `/api/tasks/:id` | Task inspection, mutation, and deletion |
| `PATCH` | `/api/tasks/:id/status` | Atomic column transition |
| `GET` | `/api/projects/:id/workload` | Real-time member capacity calculations |
| `GET` | `/api/projects/:id/board` | Unified board aggregator (project, counts, workload, tasks) |
