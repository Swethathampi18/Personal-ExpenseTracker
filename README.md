# Expense Tracker — Full Stack Project

A full-stack personal expense tracker with a Node.js/Express backend, SQLite database, and a clean HTML/CSS/JS frontend.

---
Live link: https://personal-expense-tracker-sigma-nine.vercel.app/

## Tech Stack

| Layer    | Technology                     |
|----------|-------------------------------|
| Frontend | HTML, CSS, Vanilla JavaScript  |
| Backend  | Node.js + Express.js           |
| Database | SQLite (via better-sqlite3)    |

---

## Setup Instructions (VS Code)

### Step 1 — Install Node.js
Download and install from https://nodejs.org (choose the LTS version).

### Step 2 — Open project in VS Code
```
File → Open Folder → select the expense-tracker folder
```

### Step 3 — Install backend dependencies
Open the VS Code terminal (`Ctrl + `` ` ``):
```bash
cd backend
npm install
```

### Step 4 — Start the backend server
```bash
node server.js
```
You should see:
```
✅  Expense Tracker API running at http://localhost:5000
```
Leave this terminal running.

### Step 5 — Open the frontend
Open a **new terminal** tab or just use File Explorer:
- Navigate to `frontend/`
- Right-click `index.html` → **Open with Live Server** (if you have the VS Code Live Server extension)
- OR just double-click `index.html` to open it in your browser

That's it! The app is running.

---

## API Endpoints

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | /api/expenses         | Get all expenses         |
| GET    | /api/expenses?category=Food | Filter by category |
| POST   | /api/expenses         | Add new expense          |
| PUT    | /api/expenses/:id     | Edit an expense          |
| DELETE | /api/expenses/:id     | Delete an expense        |
| GET    | /api/summary          | Get totals & breakdown   |

---

## Features

- Add, edit, delete expenses
- Filter by category or search by description
- Dashboard with summary stats
- Category-wise spending bars
- Monthly spending breakdown
- Data persists in SQLite database

---

## Author
- Name: [Your Name]
- Course: [Your Course]
