# Kanban Board

A Trello-style Kanban board built with React, TypeScript, and Vite. Drag-and-drop tasks and columns, filters, local auth, and persisted board state in the browser.

## Features

- Create, edit, complete, and delete tasks
- Drag tasks across columns and reorder within a column (@dnd-kit)
- Add custom columns (lists) and reorder columns
- Collapse/expand columns (persisted)
- Text search and multi-column filters (including speech-to-text where supported)
- Light/dark/system theme
- Client-side auth + profile (demo; data in `localStorage` via Zustand persist)

## Tech Stack

| Category        | Tools                                      |
| --------------- | ------------------------------------------ |
| Framework       | React 19, TypeScript                       |
| Build           | Vite                                       |
| Styling         | Tailwind CSS 4, shadcn/ui                  |
| Drag & drop     | @dnd-kit/core, @dnd-kit/sortable           |
| State           | Zustand + persist middleware               |
| Routing         | React Router                               |
| Animation       | Framer Motion                              |
| Tooling         | ESLint                                     |

## Project Structure

```
kanban-board/
├── public/
├── src/
│   ├── assets/           # Images and logos
│   ├── components/       # Board UI, auth shell, shared chrome
│   │   └── ui/           # shadcn/ui primitives
│   ├── hooks/
│   ├── lib/              # Utilities (e.g. cn)
│   ├── pages/            # Route pages (board, login, register, profile)
│   ├── store/            # Zustand stores (auth, board, tasks)
│   ├── types/            # Domain types (auth, board, task)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Getting Started

### Clone and install

```bash
git clone https://github.com/tracyshrestha/kanban-board.git
cd kanban-board
npm install
```

### Develop

```bash
npm run dev
```

App: [http://localhost:5173/](http://localhost:5173/)

### Build / preview

```bash
npm run build
npm run preview
```

```bash
npm run lint
```

## Architecture

### Domain model

- **Column** (`types/board.ts`): `id` (`ColumnId`), title, color. Defaults seed `useBoardStore`.
- **Task** (`types/task.ts`): `status` is the **column id** the task lives in (not a fixed enum), so custom lists work the same as To Do / In Progress / Done.
- **User** (`types/auth.ts`): local profile for the demo auth flow.

### Stores (Zustand + persist)

| Store            | Key              | Owns                                      |
| ---------------- | ---------------- | ----------------------------------------- |
| `useAuthStore`   | `auth-storage`   | login/register/profile, `isAuthenticated` |
| `useBoardStore`  | `board-storage`  | columns, order, collapsed state           |
| `useTaskStore`   | `kanban-storage` | tasks, text/status filters                |

Deleting a column removes its tasks and clears related filter entries so nothing is left orphaned.

### Drag & drop

- Board uses `@dnd-kit` `DndContext` with sortable columns and task cards.
- Moving a task updates its `status` (column id) and order in the task store.

### Auth

Routes `/` and `/profile` use `ProtectedRoute`. Login/register are client-only (passwords are not verified against a server). Use a real backend before treating this as production auth.

## License

Copyright © 2025 Tracy Shrestha. All rights reserved.
