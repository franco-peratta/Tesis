# sos-back — Documentation

REST API backend for the **Salud Online Solidaria (SOS)** telemedicine platform. Manages users, patients, providers (doctors), appointments, statistics, and email notifications.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Folder Structure](#folder-structure)
3. [How to Run Locally](#how-to-run-locally)
4. [Environment Variables](#environment-variables)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Authentication & Authorization](#authentication--authorization)
8. [Data Flows](#data-flows)
9. [Email Notifications](#email-notifications)
10. [Middleware Stack](#middleware-stack)
11. [Known Issues & Notes](#known-issues--notes)

---

## Tech Stack

| Layer           | Technology                  | Version  |
|-----------------|-----------------------------|----------|
| Runtime         | Node.js + TypeScript        | TS 5.8.3 |
| Framework       | Express.js                  | 4.21.1   |
| ORM             | Prisma                      | 6.7.0    |
| Database        | SQLite                      | (via Prisma) |
| Auth            | jsonwebtoken + bcrypt        | 9.0.0 / 5.1.0 |
| Email           | nodemailer (Gmail SMTP)     | 6.9.4    |
| Logging         | morgan                      | 1.10.0   |
| Body parsing    | body-parser                 | 1.20.1   |
| Dev server      | nodemon + ts-node           | 2.0.20 / 10.9.1 |

---

## Folder Structure

```
sos-back/
├── app.ts                          # Entry point — Express app, middleware, routes
├── .env                            # Environment variables
├── prisma/
│   ├── schema.prisma               # Database schema (SQLite)
│   └── dev.db                      # SQLite file (auto-generated on migrate)
├── src/
│   ├── config/
│   │   └── db.ts                   # Prisma client singleton
│   ├── middlewares/
│   │   └── auth.ts                 # JWT verification middleware
│   ├── email/
│   │   ├── index.ts                # nodemailer email service
│   │   └── templates/
│   │       ├── appointment_created.html
│   │       └── test_template.html
│   ├── routes/
│   │   ├── index.ts                # Mounts /api/v1
│   │   └── v1/
│   │       ├── index.ts            # Aggregates routes, applies auth middleware
│   │       ├── auth.ts             # Public: /auth/login, /auth/register
│   │       ├── user.ts             # CRUD /user
│   │       ├── patient.ts          # CRUD /patient
│   │       ├── provider.ts         # CRUD /provider
│   │       ├── appointment.ts      # CRUD /appointment + slots
│   │       ├── stats.ts            # GET /stats
│   │       └── admin.ts            # Admin routes (fully commented out)
│   ├── controllers/
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── patient.ts
│   │   ├── provider.ts
│   │   ├── appointment.ts
│   │   ├── stats.ts
│   │   └── admin.ts
│   ├── repos/
│   │   ├── user.ts
│   │   ├── patient.ts
│   │   ├── provider.ts
│   │   └── appointment.ts
│   └── types/
│       └── express/index.d.ts      # Extends Express Request with `user`
├── package.json
└── tsconfig.json
```

**Architecture:** `Routes → Controllers → Repos → Prisma → SQLite`

---

## How to Run Locally

### Prerequisites
- Node.js (v16+)
- npm
- No external database needed — SQLite is file-based.

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (see Environment Variables below)

# 3. Create the SQLite database and apply the schema
npm run migrate
# Creates prisma/dev.db automatically

# 4. Start dev server (auto-restarts on changes)
npm start
# Runs on http://localhost:3000
```

### Scripts

| Script          | Command                 | Description                          |
|-----------------|-------------------------|--------------------------------------|
| `start`         | `nodemon app.ts`        | Dev server with auto-reload          |
| `build`         | `tsc`                   | Compile TypeScript → JavaScript      |
| `build-render`  | `npm install && tsc`    | Install + build (used for deployment)|
| `migrate`       | `prisma db push`        | Sync schema → SQLite file            |
| `prettier`      | `prettier --write .`    | Format all files                     |

> There is no Docker setup. SQLite requires no external server.

---

## Environment Variables

```env
# Database
SQLITE_DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET='change-this-secret'
JWT_EXPIRATION='3h'

# Server
HOST=localhost
PORT=3000

# Email (use a Gmail App Password)
EMAIL_ADDRESS=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

## Database Schema

**Database:** SQLite via Prisma. File: `prisma/dev.db`.

### Enums

```
Role:   admin | patient | provider
Status: espera | en_progreso | terminado | cancelado
```

### Tables

#### `User`
| Field      | Type     | Notes                      |
|------------|----------|----------------------------|
| id         | Int      | PK, auto-increment         |
| email      | String   | Unique                     |
| password   | String   | bcrypt-hashed              |
| role       | Role     |                            |
| created_at | DateTime | Auto-set on creation       |

One-to-one relation to `Admin`, `Patient`, or `Provider`.

---

#### `Patient`
| Field       | Type     | Notes                              |
|-------------|----------|------------------------------------|
| id          | Int      | PK, references User.id             |
| name        | String   |                                    |
| dni         | String   | National ID                        |
| dob         | String   | Date of birth                      |
| phoneNumber | String   | Nullable                           |
| emr         | String   | Electronic Medical Record (markdown)|
| created_at  | DateTime |                                    |

Has many `Appointment` (cascade delete).

> New patients are created with a default password `"saludonlinesolidaria"` and a pre-filled markdown EMR template.

---

#### `Provider`
| Field       | Type     | Notes                                       |
|-------------|----------|---------------------------------------------|
| id          | Int      | PK, references User.id                      |
| name        | String   |                                             |
| phoneNumber | String   | Nullable                                    |
| shifts      | String   | JSON-serialized weekly schedule (see below) |
| created_at  | DateTime |                                             |

Has many `Appointment` (cascade delete).

**`shifts` JSON structure:**
```json
{
  "monday":    { "available": true,  "shifts": [{ "from": 8, "to": 12 }, { "from": 14, "to": 18 }] },
  "tuesday":   { "available": true,  "shifts": [{ "from": 8, "to": 12 }] },
  "wednesday": { "available": false, "shifts": [] }
}
```

---

#### `Admin`
| Field | Type   | Notes                  |
|-------|--------|------------------------|
| id    | Int    | PK, references User.id |
| name  | String |                        |

---

#### `Appointment`
| Field      | Type     | Notes                                        |
|------------|----------|----------------------------------------------|
| id         | String   | PK, UUID (auto-generated)                    |
| status     | Status   | espera / en_progreso / terminado / cancelado |
| date       | String   | YYYY-MM-DD                                   |
| time       | String   | HH:MM                                        |
| duration   | Int      | Minutes (default: 30)                        |
| patientId  | Int      | FK → Patient (cascade delete)                |
| providerId | Int      | FK → Provider (cascade delete)               |
| created_at | DateTime |                                              |

---

## API Endpoints

**Base URL:** `http://localhost:3000/api/v1`

`/auth` routes are public. All other routes require `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint          | Body                              | Description       |
|--------|-------------------|-----------------------------------|-------------------|
| POST   | `/auth/login`     | `{ email, password, role }`       | Login, returns JWT|
| POST   | `/auth/register`  | `{ name, email, password, ... }`  | Register account  |

**Login response:** `{ token, user: { id, email } }`

### Stats
| Method | Endpoint | Description              |
|--------|----------|--------------------------|
| GET    | `/stats` | Dashboard statistics     |

**Response fields:** `totalPatients`, `totalProviders`, `totalAppointments`, `completedAppointments`, `pendingAppointments`, `upcomingAppointments`, `newPatientsLastQuarter`, `completedAppointmentsLastQuarter`

### Users
| Method | Endpoint     | Description            |
|--------|--------------|------------------------|
| GET    | `/user`      | List all users         |
| GET    | `/user/:id`  | Get user by ID         |
| PUT    | `/user/:id`  | Update user            |
| DELETE | `/user/:id`  | Delete user (cascades) |

### Patients
| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| GET    | `/patient`                  | List all patients                  |
| GET    | `/patient/:id`              | Get patient by ID                  |
| GET    | `/patient/:id/appointments` | Get patient with appointments      |
| POST   | `/patient`                  | Create patient                     |
| PUT    | `/patient/:id`              | Update patient                     |
| PATCH  | `/patient/:id/emr`          | Update EMR only                    |
| DELETE | `/patient/:id`              | Delete patient                     |

### Providers
| Method | Endpoint        | Description                           |
|--------|-----------------|---------------------------------------|
| GET    | `/provider`     | List all providers                    |
| GET    | `/provider/:id` | Get provider by ID                    |
| POST   | `/provider`     | Create provider                       |
| PUT    | `/provider/:id` | Update provider (name, phone, shifts) |
| DELETE | `/provider/:id` | Delete provider                       |

### Appointments
| Method | Endpoint                                          | Description                           |
|--------|---------------------------------------------------|---------------------------------------|
| GET    | `/appointment`                                    | List all appointments                 |
| GET    | `/appointment/:id`                                | Get appointment (with patient & provider) |
| GET    | `/appointment/patient/:id`                        | Appointments for a patient            |
| GET    | `/appointment/provider/:id`                       | Appointments for a provider           |
| GET    | `/appointment/provider/:id?status=X,Y`            | Filter by status (comma-separated)    |
| GET    | `/appointment/slots/:provider_id?date=YYYY-MM-DD` | Occupied time slots for a provider    |
| POST   | `/appointment`                                    | Create appointment                    |
| PUT    | `/appointment/:id`                                | Full update                           |
| PATCH  | `/appointment/:id`                                | Update status only                    |
| DELETE | `/appointment/:id`                                | Delete appointment                    |

> **Admin routes** (`/admin`) exist in the codebase but are fully commented out and non-functional.

---

## Authentication & Authorization

### Login Flow
1. `POST /auth/login` with `{ email, password, role }`.
2. User fetched by email; `bcrypt.compare()` validates password.
3. JWT signed with `{ id, email, role }`, algorithm HS512, expiry from `JWT_EXPIRATION`.
4. Returns `{ token, user: { id, email } }`.

### Middleware
`src/middlewares/auth.ts` verifies the `Authorization: Bearer <token>` header, fetches the user from DB, and attaches it to `req.user`.

Applied in `src/routes/v1/index.ts` to all route groups **except** `/auth`. Only auth endpoints are public.

### CORS
Restricted to:
- `https://tesis-sable.vercel.app`
- `https://tesis-7gu6.vercel.app`
- Any `http://localhost:*`

### Password Hashing
bcrypt with 10 salt rounds — applied on registration and password updates. New patients get a default password of `"saludonlinesolidaria"`.

---

## Data Flows

### Appointment Creation
```
POST /appointment { patientId, providerId, date, time, duration }
  → Prisma creates Appointment (id = UUID)
  → sendAppointmentCreationEmail()
      → fetch patient + provider names
      → load appointment_created.html template
      → replace {{nombre}}, {{medico}}, {{fecha}}, {{appointment_id}}
      → send via Gmail SMTP
  → return appointment
```

### Slot Availability
```
GET /appointment/slots/:provider_id?date=YYYY-MM-DD
  → fetch provider shifts (parse JSON string)
  → determine day of week from date
  → generate 5-minute slots for each shift window
  → mark slots occupied by existing appointments (time + duration)
  → return list of occupied slots
```

### Statistics
```
GET /stats
  → parallel Prisma queries:
      count patients, providers, appointments
      count by status (completed, pending, upcoming)
      count new patients this quarter
      count completed appointments this quarter
  → return aggregated object
```

---

## Email Notifications

Sent on appointment creation via **nodemailer** (Gmail SMTP).

Credentials are read from `EMAIL_ADDRESS` and `EMAIL_PASSWORD` environment variables (use a Gmail App Password).

**Template variables in `appointment_created.html`:**
- `{{nombre}}` — Patient name
- `{{medico}}` — Provider name
- `{{fecha}}` — Appointment date
- `{{appointment_id}}` — Appointment UUID

---

## Middleware Stack

Order in `app.ts`:
1. **CORS** — allowed origins only
2. **JSON body parser**
3. **URL-encoded body parser**
4. **Morgan** — request logging
5. **Routes** — mounted at `/api/v1`

Auth middleware is applied per-route-group inside `src/routes/v1/index.ts`, not globally.

---

## Known Issues & Notes

| Issue | Details |
|-------|---------|
| Weak default JWT secret | Change `JWT_SECRET` before any deployment |
| Admin routes disabled | `/admin` endpoints are fully commented out |
| Appointment controller typos | `patienId` (missing `t`) and `data` instead of `date` in `appointment.ts` |
| No input validation | No Zod/Joi validation on request bodies |
| No error-handling middleware | Unhandled errors propagate without a global handler |
| No tests | Test script exists but is empty |
