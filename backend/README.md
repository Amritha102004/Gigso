# Gigso Backend

REST API for the **Gigso** platform — a gig marketplace connecting workers with owners, managed by an admin panel.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express 5 |
| Database | MongoDB (Mongoose) |
| Validation | Zod |
| Auth | JWT (access + refresh), Google OAuth 2.0 |
| Email | Nodemailer (Gmail) |
| Linting | ESLint + Prettier |

---

## Architecture

The project follows a **layered architecture** (not modular monolith):

```
src/
├── config/
│   ├── env.config.ts        # All env vars with defaults
│   └── db.ts                # connectDB() helper
├── controllers/             # HTTP layer — handles req/res only
│   ├── auth.controller.ts
│   └── users.controller.ts
├── services/                # Business logic
│   ├── auth.service.ts
│   ├── users.service.ts
│   └── email.service.ts
├── repositories/            # Data access layer
│   ├── base.repository.ts   # Generic CRUD (create, findById, update, delete…)
│   ├── user.repository.ts
│   └── otp.repository.ts
├── routes/                  # Route definitions + middleware wiring
│   ├── auth.routes.ts
│   └── users.routes.ts
├── validations/             # Zod request schemas
│   └── auth.validation.ts
├── middlewares/
│   ├── validate.middleware.ts  # Zod schema runner
│   ├── error.middleware.ts     # Global error handler
│   ├── auth.middleware.ts      # JWT guard
│   └── role.middleware.ts      # Role-based guard
├── interfaces/
│   ├── services/            # IAuthService, IUsersService, IEmailService
│   └── repositories/        # IBaseRepository, IUserRepository, IOtpRepository
├── models/                  # Mongoose models
│   ├── user.model.ts
│   └── otp.model.ts
├── dtos/
│   └── user.dto.ts          # UserResponseDTO (safe user shape)
├── mappers/
│   └── user.mapper.ts       # IUser → UserResponseDTO
├── constants/
│   └── messages.ts          # Centralised response strings
├── types/
│   └── api-response.type.ts # ApiResponse<T>
├── utils/
│   ├── asyncHandler.ts      # Wraps async controllers (no try/catch needed)
│   ├── jwt.ts
│   ├── cookie.ts
│   ├── hash.ts
│   ├── otp.ts
│   └── sendEmail.ts
├── app.ts                   # Express app setup
└── server.ts                # Entry point
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) for Nodemailer

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the `backend/` root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/gigso

# JWT
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Nodemailer (Gmail)
NODEMAILER_EMAIL=your@gmail.com
NODEMAILER_PASSWORD=your_app_password

# OTP
OTP_EXPIRY_MINUTES=5

NODE_ENV=development
```

### Run in Development

```bash
npm run dev
```

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with ts-node-dev (hot-reload) |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format with Prettier |

---

## API Endpoints

### Auth — `/api/auth`

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/signup` | Send registration OTP | — |
| POST | `/verify-otp` | Verify OTP (register or reset) | — |
| POST | `/resend-otp` | Resend OTP | — |
| POST | `/login` | Email + password login | — |
| POST | `/google` | Google OAuth login/signup | — |
| POST | `/refresh-token` | Refresh access token via cookie | — |
| POST | `/forgot-password` | Send password-reset OTP | — |
| POST | `/reset-password` | Reset password with OTP | — |
| POST | `/logout` | Clear refresh token cookie | — |

### Admin — `/api/admin` *(requires JWT + admin role)*

| Method | Path | Description |
|---|---|---|
| GET | `/users` | Get all users (paginated, searchable) |
| GET | `/owners` | Get all owners |
| GET | `/workers` | Get all workers |
| GET | `/users/:id` | Get user by ID |
| PATCH | `/users/:id/approve` | Approve an owner |
| PATCH | `/users/:id/suspend` | Toggle suspend/unsuspend a user |

### Query Parameters (list endpoints)

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `search` | string | Search by name or email |

---

## Design Principles

- **Layered Architecture** — Controllers → Services → Repositories
- **Dependency Injection** — Services receive repositories and config via constructor
- **Generic Repository** — `BaseRepository<T>` provides common CRUD; domain repos extend it
- **Zod Validation** — All request bodies validated by middleware before reaching controllers
- **asyncHandler** — Eliminates try/catch boilerplate; unhandled rejections flow to global error handler
- **DTO + Mapper** — `UserResponseDTO` ensures passwords and internal fields are never leaked in responses
- **ENV Config** — Single `ENV` object centralises all environment variable access with fallback defaults
