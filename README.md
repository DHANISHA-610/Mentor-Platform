# Mentor Platform

Mentor Platform is a split frontend and backend application.

## Project Structure

- `Frontend/` - Vite + React client
- `Backend/` - Node.js + Express + MongoDB

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- MongoDB running locally or a MongoDB connection string

## Setup

Install dependencies from the project root:

```bash
npm install
```

Copy `Backend/.env.example` to `Backend/.env` and update the MongoDB connection string if needed.

## Available Commands

- `npm run dev:frontend` - start the Vite frontend
- `npm run build:frontend` - build the frontend for production
- `npm run dev:backend` - start the Express backend with nodemon
- `npm run start:backend` - start the backend in production mode

## Notes

- The backend exposes a health endpoint at `/api/health`.
- Frontend and backend each keep their own local package setup, but the root package.json provides workspace-level commands.