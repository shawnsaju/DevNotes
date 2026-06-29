# DevNotes

DevNotes is a full-stack notes application for creating, organizing, editing, and exporting markdown-based notes. It combines a modern React frontend with a lightweight Node.js/Express backend and a Prisma-managed SQLite database.

## Project Overview

The application allows users to:
- create and manage personal notes
- add tags and pin important notes
- edit note content in a markdown editor
- view notes in a clean reading layout
- export notes as PDF
- sign up, sign in, and stay authenticated securely

## Main Features

- User authentication with JWT and password hashing
- Protected note routes for each authenticated user
- Markdown-based note editing and preview
- Tag filtering and search
- Pin/unpin support for important notes
- Delete confirmation flow
- Responsive UI for desktop and mobile screens

## Project Structure

- client/: React frontend built with Vite
- server/: Express API, Prisma models, authentication, and file handling
- server/prisma/: Database schema and migrations

## Technologies Used and Why

| Technology | Used For | Why It Was Chosen |
| --- | --- | --- |
| React | Frontend UI and component-based app structure | React makes it easy to build interactive interfaces and manage state across reusable components. |
| Vite | Fast development server and production build tool | Vite provides a very fast development experience with quick hot reloads and efficient builds. |
| React Router DOM | Client-side routing | It enables smooth navigation between login, dashboard, editor, and note view pages. |
| Axios | API requests from the client | Axios offers a simple and reliable way to communicate with the backend. |
| @uiw/react-md-editor | Markdown editing experience | This editor gives users a rich markdown editing environment with toolbar support and preview functionality. |
| react-markdown | Rendering markdown content | It provides a straightforward way to display markdown safely and cleanly in the app. |
| remark-gfm / rehype-highlight | Markdown enhancements | These plugins add GitHub-flavored markdown support and syntax highlighting for code blocks. |
| html2pdf.js | Exporting notes to PDF | It allows users to convert notes into downloadable PDF files without extra complexity. |
| CSS custom properties and custom styling | The visual design system | Custom CSS variables make theme switching and consistent styling much easier to maintain. |
| Node.js | Backend runtime | Node.js is ideal for building fast, scalable JavaScript-based APIs. |
| Express.js | REST API server | Express is lightweight and simple for creating routes, middleware, and request handling. |
| Prisma | Database ORM and schema management | Prisma simplifies database access, schema definitions, and migrations while reducing boilerplate. |
| SQLite | Local relational database | SQLite is lightweight, easy to set up, and suitable for this project’s small-to-medium data needs. |
| JSON Web Tokens (JWT) | User authentication | JWT provides a compact and standard way to authenticate users across requests. |
| bcryptjs | Password hashing | bcryptjs securely hashes passwords before storing them in the database. |
| CORS | Cross-origin API access | CORS allows the frontend and backend to communicate locally during development. |
| Multer | File upload handling | Multer makes it simple to process uploaded files in the backend. |
| Nodemon | Backend development convenience | Nodemon restarts the server automatically while editing code during development. |

## Authentication Flow

1. A user registers or signs in through the frontend.
2. The server validates the credentials.
3. If valid, the server returns a JWT token.
4. The client stores the token and attaches it to future requests.
5. Protected routes verify the token before allowing access to notes.

## Data Model

The application uses two primary database models:
- User: stores authentication information and related notes
- Note: stores the note title, markdown content, tags, pin state, and ownership information

## Getting Started

To run the app locally, install dependencies and start both the client and server.

### 1. Start the backend server
```bash
cd server
npm install
npm run dev
```

The server listens on `http://localhost:3001` by default and uses the `.env` file in `server/`.

### 2. Start the frontend app
```bash
cd client
npm install
npm run dev
```

The Vite app runs on `http://localhost:5173` by default and proxies API requests to the server.

### Environment
- The backend expects a `server/.env` file with at least:
  - `DATABASE_URL="file:./dev.db"`
  - `PORT=3001`
  - `JWT_SECRET="your_secret_here"`

### Quick run summary
```bash
cd server
npm install
npm run dev
# open a second terminal
cd client
npm install
npm run dev
```

You need to run specific Prisma commands before your backend project can talk to your SQL database
```bash
# 1. Instantly build your local database tables to match your code
npx prisma db push

# 2. Generate the auto-complete client code for your JavaScript files
npx prisma generate

```

Create and apply a new migration to your database is you modify `schema.prisma` file

```bash
npx prisma migrate dev
```

## Why This Stack Fits the Project

This stack was chosen because it balances simplicity, performance, and developer productivity:
- React and Vite provide a fast and modern frontend experience.
- Express and Prisma keep the backend simple while still being robust.
- SQLite is enough for a local-first notes app without requiring a heavy database setup.
- Markdown-focused libraries make the note editor feel professional and useful.

## Summary

DevNotes is a practical, modern note-taking app built with a clean separation between frontend, backend, and database concerns. The chosen technologies work well together to deliver a responsive experience with secure authentication and a smooth markdown workflow.
