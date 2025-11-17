📌 Kanban Board

A simple and modern Trello Kanban Template style task management board built using React, TypeScript, and Vite.
Supports drag & drop, multiple columns, and a clean UI to organize tasks visually.

⭐ Project Overview

This Kanban Board allows users to:

Create, edit, and delete tasks

Move tasks across columns with drag & drop

Reorder tasks within the same column

Use a clean, responsive, and accessible UI

Easily extend with backend APIs or persistent storage

This project was built as part of improving my UI engineering and advanced React patterns.


🛠️ Tech Stack
Category	Tools
Framework	React (TypeScript)
Build System	Vite
Drag & Drop	dnd-kit
Styling	CSS / Tailwind-ready
State Mgmt	Local state, clean TypeScript models
Tooling	ESLint, Prettier


🗂️ Project Structure
kanban-board/
│
├── public/                # Static assets
├── src/
│   ├── components/        # UI components (Columns, Tasks, Dialogs)
│   ├── hooks/             # Custom hooks (useSortable logic, etc.)
│   ├── types/             # TypeScript types (Column, Task, Status)
│   ├── utils/             # Utility helpers
│   ├── App.tsx            # Main app layout
│   └── main.tsx           # Entry point
│
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript config
└── package.json


🚀 Getting Started
1️⃣ Clone the Repository
git clone https://github.com/tracyshrestha/kanban-board.git
cd kanban-board

2️⃣ Install Dependencies
npm install
# or
yarn install

3️⃣ Start Development Server
npm run dev
# or
yarn dev


The project will start on:

http://localhost:5173/

4️⃣ Build for Production
npm run build

5️⃣ Preview Production Build
npm run preview


🧠 Approach & Architecture

The Kanban board is built with a simple but scalable architecture.

🔹 State Structure

Tasks and columns are modeled using TypeScript interfaces:

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

🔹 Drag & Drop

Implemented using @dnd-kit/core and @dnd-kit/sortable

Smooth animations and CSS transforms

Each column is wrapped in a SortableContext

Tasks use useSortable for movement and reordering

🔹 UI/UX Logic

Hover actions for edit/delete buttons

Floating buttons that don’t shift text

Automatic column width layout

Responsive and fast rendering

🔹 Extensibility

This project is built with future scalability in mind. You could add:

User authentication

Backend with Laravel/Node.js

Real-time features (Pusher/WebSocket)

Task filtering, labels & priority

Database persistence

🤝 Contributing

Pull requests are welcome!
To contribute:

Fork the project

Create a feature branch

Commit your changes

Open a PR

📄 License
Copyright © 2025 Tracy Shrestha
All rights reserved.