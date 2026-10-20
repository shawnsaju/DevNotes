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

| Technology                               | Used For                                          |                                                       
| ---------------------------------------- | ------------------------------------------------- | 
| React                                    | Frontend UI and component-based app structure     | 
| Vite                                     | Fast development server and production build tool | 
| React Router DOM                         | Client-side routing                               |
| Axios                                    | API requests from the client                      |                      
| @uiw/react-md-editor                     | Markdown editing experience                       |
| react-markdown                           | Rendering markdown content                        |
| remark-gfm / rehype-highlight            | Markdown enhancements                             |
| html2pdf.js                              | Exporting notes to PDF                            |
| CSS custom properties and custom styling | The visual design system                          |
| Node.js                                  | Backend runtime                                   | 
| Express.js                               | REST API server                                   | 
| Prisma                                   | Database ORM and schema management                | 
| SQLite                                   | Local relational database                         |
| JSON Web Tokens (JWT)                    | User authentication                               |
| bcryptjs                                 | Password hashing                                  |                             
| CORS                                     | Cross-origin API access                           | 
| Multer                                   | File upload handling                              |            
| Nodemon                                  | Backend development convenience                   |



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

## Summary

DevNotes is a practical, modern note-taking app built with a clean separation between frontend, backend, and database concerns. The chosen technologies work well together to deliver a responsive experience with secure authentication and a smooth markdown workflow.
