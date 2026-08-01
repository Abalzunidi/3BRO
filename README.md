# 3bro — Travel Planner

Modern frontend-only travel planning web app for organizing trips, schedules, activities, budgets, tasks, and photo galleries.

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui-style components (Radix)
- Lucide Icons
- Framer Motion
- @dnd-kit (drag & drop)

## Getting Started

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Features

- **Dashboard** — Trip stats, progress, countdown, calendar
- **Schedule** — Daily itinerary with drag & drop reordering
- **Activities** — Activity cards with images, maps links, detail modal
- **Budget** — Expense tracking with category charts
- **Tasks** — To-do list with edit / delete / complete
- **Gallery** — Upload, preview, download, and delete photos
- **Dark mode** — Toggle in the top navbar
- **Empty by default** — No sample data; add your own via Settings & pages

Data is saved in `localStorage` on your device only — no backend or login.
