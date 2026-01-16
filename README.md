# 📚 Library Management System (LibUI)

A modern, responsive, and full-featured UI for managing library operations. Built with React 19, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Dashboard**: Overview of library statistics (Books, Members, Active Borrows, Overdue Books) and recent activity.
- **Book Management**:
  - 📚 View, Add, Edit, and Delete books.
  - 🔍 Search and filter books by title or author.
  - 📦 Track available copies and genres.
- **Member Management**:
  - 👥 Manage library members (Add, Edit, Delete).
  - 📜 View member history and details.
- **Borrowing System**:
  - 🔄 Easy Borrow & Return workflow.
  - 📅 Track due dates and overdue items.
  - ⚡ Real-time availability updates.
- **Staff Management**:
  - 🛡️ Role-based access control (Admins & Librarians).
  - 🔐 Secure authentication.
- **Reports & Analytics**:
  - 📊 Visual reports on borrowing trends and inventory.
- **UI/UX**:
  - 🎨 Modern, clean interface with Tailwind CSS.
  - 🌓 Dark/Light mode support.
  - 📱 Fully responsive design.
  - 🔔 Toast notifications for user feedback.

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Handling**: [date-fns](https://date-fns.org/)

## ⚙️ Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or Bun/Yarn/pnpm)

## 📦 Installation

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd LibUI
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Start the development server**:

    ```bash
    npm run dev
    ```

4.  **Open the app**:
    Visit `http://localhost:5173` in your browser.

## 🔧 Building for Production

To create a production-ready build:

```bash
npm run build
```

This will generate the static assets in the `dist` directory.

## 📂 Project Structure

```
LibUI/
├── src/
│   ├── components/      # Reusable UI components (Cards, Dialogs, Nav)
│   ├── config/          # App configuration (API URLs)
│   ├── contexts/        # React Contexts (Auth, Toast, Theme)
│   ├── routes/          # Application pages/routes (TanStack Router)
│   ├── types/           # TypeScript type definitions
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles & Tailwind
├── public/              # Static assets
└── package.json         # Dependencies & scripts
```

## 🔌 API Integration

The frontend expects a RESTful API running at the address specified in `src/config/index.ts`.
Default API URL: `http://localhost:3000` (or as configured).

**Key Endpoints**:

- `POST /auth/login`
- `GET /books`, `POST /books`, `PATCH /books/:id`, `DELETE /books/:id`
- `GET /members`, `POST /members`
- `GET /borrow-records`, `POST /borrow-records/borrow`, `POST /borrow-records/return`

## 👨‍💻 Author

**Samuel7zenebe** - _Full Stack Software Developer Assignment_

---

_Built with ❤️ by Samuel Zenebe._
