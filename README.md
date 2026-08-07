# PriviGuard AI

PriviGuard AI is an AI-powered Privacy Impact Assessment and Privacy Compliance Management SaaS platform. It is designed primarily for Data Protection Officers (DPOs), Organization Administrators, Compliance Officers, and authorized team members.

## Current Status
**Phase 3.1: Technical Foundation**
- The project architecture has been defined.
- UI/UX planning is complete.
- Basic frontend (React + Vite + Tailwind) is running.
- Basic backend (Express + Node.js) is running and configured.
- Database (MongoDB via Mongoose) connection structure is set up.
- Note: Features like Authentication, Dashboard, Privacy Assessment, and AI Copilot have **not** been implemented yet. They will be built in subsequent phases.

## Technology Stack
- **Frontend**: React.js (Vite), Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas, Mongoose
- **AI**: Google Gemini API
- **Authentication**: JWT (Pending Phase 3.2+)

## Project Structure
The project uses a unified Full-Stack architecture suitable for deployment as a single service, while maintaining clear code separation.

```
PriviGuard-AI/
├── src/                  # Frontend React source code
│   ├── assets/           # Static assets
│   ├── components/       # Reusable React components
│   ├── layouts/          # Page layouts
│   ├── pages/            # Route components
│   ├── routes/           # Routing configuration
│   ├── services/         # API services (Axios)
│   ├── hooks/            # Custom React hooks
│   ├── context/          # React Context providers
│   └── utils/            # Frontend utilities
├── server/               # Backend Express source code
│   ├── config/           # Database and env configs
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middlewares (auth, errors)
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes definition
│   ├── services/         # Business logic & external APIs
│   └── utils/            # Backend utilities
├── server.ts             # Express application entry point (binds to port 3000, mounts Vite)
├── .env.example          # Example environment variables
├── package.json          # Unified package and script definitions
└── vite.config.ts        # Vite build configuration
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure the required variables:
```bash
cp .env.example .env
```
Ensure you provide a valid `MONGODB_URI`. Note that the `GEMINI_API_KEY` is not required for this phase but will be in later phases.

### 3. Run the Development Server
```bash
npm run dev
```
The application runs on `http://localhost:3000`. The frontend and backend are served together.
- Frontend App: `http://localhost:3000/`
- Backend API: `http://localhost:3000/api/health`

### 4. Build for Production
```bash
npm run build
npm run start
```
