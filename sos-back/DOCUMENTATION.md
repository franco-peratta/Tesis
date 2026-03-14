# sos-back — Documentation

REST API backend for the **Salud Online Solidaria (SOS)** telemedicine platform. Manages users, patients, providers (doctors), appointments, email notifications, and video call token generation.

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
10. [Video Call Integration](#video-call-integration)
11. [Middleware Stack](#middleware-stack)
12. [Known Issues & Notes](#known-issues--notes)

---

## Tech Stack

| Layer            | Technology                     | Version   |
|------------------|--------------------------------|-----------|
| Runtime          | Node.js + TypeScript           | TS 4.9.5  |
| Framework        | Express.js                     | 4.18.2    |
| ORM              | Prisma                         | 4.12.0    |
| Database         | MySQL                          | 8+        |
| Auth             | jsonwebtoken + bcrypt           | 9.0.0 / 5.1.0 |
| Email            | nodemailer (Gmail SMTP)        | 6.9.4     |
| Video calls      | Twilio Video                   | 4.11.1    |
| Request logging  | morgan                         | 1.10.0    |
| Dev server       | nodemon + ts-node              | 2.0.20    |

---

## Folder Structure

```
sos-back/
├── app.ts                          # Entry point — creates Express app, registers middleware & routes
├── docker-compose.yml              # MySQL container setup
├── .env                            # Environment variables
├── prisma/
│   ├── schema.prisma               # Database schema (models, enums, relations)
│   └── init/                       # Optional DB initialization SQL scripts
├── src/
│   ├── config/
│   │   └── db.ts                   # Prisma client singleton
│   ├── middlewares/
│   │   └── auth.ts                 # JWT verification middleware (currently disabled)
│   ├── email/
│   │   ├── index.ts                # Email sending service (nodemailer)
│   │   └── templates/
│   │       ├── appointment_created.html  # Email template for new appointments
│   │       └── test_template.html
│   ├── routes/
│   │   ├── index.ts                # Mounts /api/v1
│   │   └── v1/
│   │       ├── index.ts            # Aggregates all v1 routes
│   │       ├── auth.ts             # POST /auth/login, POST /auth/register
│   │       ├── user.ts             # CRUD /user
│   │       ├── patient.ts          # CRUD /patient
│   │       ├── provider.ts         # CRUD /provider
│   │       ├── appointment.ts      # CRUD /appointment + slots
│   │       ├── admin.ts            # CRUD /admin
│   │       └── videocall/
│   │           └── twilio/
│   │               ├── twilio.ts   # GET /videocall/twilio route
│   │               └── tokens.ts   # Twilio token generation logic
│   ├── controllers/
│   │   ├── auth.ts                 # login / register logic
│   │   ├── user.ts                 # User CRUD logic
│   │   ├── patient.ts              # Patient CRUD logic
│   │   ├── provider.ts             # Provider CRUD logic
│   │   ├── appointment.ts          # Appointment CRUD + slot calculation
│   │   └── admin.ts                # Admin CRUD logic
│   └── repos/
│       ├── user.ts                 # DB queries for users
│       ├── patient.ts              # DB queries for patients
│       ├── provider.ts             # DB queries for providers
│       └── appointment.ts          # DB queries for appointments
├── package.json
└── tsconfig.json
```

**Architecture pattern:** `Routes → Controllers → Repos → Prisma → MySQL`

---

## How to Run Locally

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- Docker (recommended for the database), or a local MySQL instance

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start the MySQL database (Docker)
docker-compose up -d

# 3. Push Prisma schema to the database
npm run migrate
# This runs: npx prisma db push

# 4. Start the development server (auto-restarts on changes)
npm start
# Runs on http://localhost:5000
```

### Available Scripts

| Script          | Command                   | Description                          |
|-----------------|---------------------------|--------------------------------------|
| `start`         | `nodemon app.ts`          | Dev server with auto-reload          |
| `migrate`       | `prisma db push`          | Sync Prisma schema → database        |
| `prettier`      | `prettier --write .`      | Format all source files              |
| `test`          | *(not implemented)*       | Placeholder                          |

### Without Docker (manual MySQL)
1. Create a MySQL database named `sos`.
2. Update `MYSQL_DATABASE_URL` in `.env` with your credentials.
3. Run `npm run migrate`.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Database
MYSQL_DATABASE_URL='mysql://root:root@localhost:3306/sos'

# JWT
JWT_SECRET='sos'
JWT_EXPIRATION='3h'

# Server
PORT=5000

# Twilio (required for video call token endpoint)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_API_KEY=your_twilio_api_key
TWILIO_API_SECRET=your_twilio_api_secret
```

> **Note:** Email credentials are currently hardcoded in `src/email/index.ts`. Move them to `.env` before deploying to production.

---

## Database Schema

Database: **MySQL** via Prisma ORM.

### Enums

```
Role:   admin | patient | provider
Status: espera | en_progreso | terminado | cancelado
```

### Tables

#### `User`
| Field    | Type   | Notes                          |
|----------|--------|--------------------------------|
| id       | Int    | PK, auto-increment             |
| email    | String | Unique                         |
| password | String | bcrypt-hashed                  |
| role     | Role   | admin / patient / provider     |

Relations: one-to-one with `Admin`, `Patient`, or `Provider`.

---

#### `Patient`
| Field       | Type   | Notes                         |
|-------------|--------|-------------------------------|
| id          | Int    | PK, references User.id        |
| name        | String |                               |
| dni         | String | National ID                   |
| dob         | String | Date of birth                 |
| phoneNumber | String | Nullable                      |
| emr         | Text   | Electronic Medical Record     |

Relations: belongs to `User`; has many `Appointment` (cascade delete).

---

#### `Provider`
| Field       | Type   | Notes                                            |
|-------------|--------|--------------------------------------------------|
| id          | Int    | PK, references User.id                           |
| name        | String |                                                  |
| phoneNumber | String | Nullable                                         |
| shifts      | JSON   | Weekly schedule (see structure below)            |

**`shifts` JSON structure:**
```json
{
  "monday":    { "available": true,  "shifts": [{ "from": 8, "to": 12 }, { "from": 14, "to": 18 }] },
  "tuesday":   { "available": true,  "shifts": [{ "from": 8, "to": 12 }] },
  "wednesday": { "available": false, "shifts": [] },
  ...
}
```

Relations: belongs to `User`; has many `Appointment` (cascade delete).

---

#### `Admin`
| Field | Type   | Notes                  |
|-------|--------|------------------------|
| id    | Int    | PK, references User.id |
| name  | String |                        |

Relations: belongs to `User`.

---

#### `Appointment`
| Field      | Type   | Notes                                          |
|------------|--------|------------------------------------------------|
| id         | Int    | PK, auto-increment                             |
| status     | Status | espera / en_progreso / terminado / cancelado   |
| date       | String | Format: YYYY-MM-DD                             |
| time       | String | Format: HH:MM                                  |
| duration   | Int    | Minutes (default: 30)                          |
| patientId  | Int    | FK → Patient (cascade delete)                  |
| providerId | Int    | FK → Provider (cascade delete)                 |

---

## API Endpoints

**Base URL:** `http://localhost:5000/api/v1`

### Auth
| Method | Endpoint         | Body                                      | Description             |
|--------|------------------|-------------------------------------------|-------------------------|
| POST   | `/auth/login`    | `{ email, password, role }`               | Login, returns JWT      |
| POST   | `/auth/register` | `{ name, email, password, dni, dob, ... }`| Register patient/provider|

**Login response:**
```json
{ "token": "...", "user": { "id": 1, "email": "..." } }
```

---

### Users
| Method | Endpoint      | Description              |
|--------|---------------|--------------------------|
| GET    | `/user`       | Get all users            |
| GET    | `/user/:id`   | Get user by ID           |
| PUT    | `/user/:id`   | Update user              |
| DELETE | `/user/:id`   | Delete user (cascades)   |

---

### Patients
| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| GET    | `/patient`                  | Get all patients                   |
| GET    | `/patient/:id`              | Get patient by ID                  |
| GET    | `/patient/:id/appointments` | Get patient with full appointment list |
| POST   | `/patient`                  | Create patient                     |
| PUT    | `/patient/:id`              | Update patient info                |
| PATCH  | `/patient/:id/emr`          | Update EMR only                    |
| DELETE | `/patient/:id`              | Delete patient                     |

---

### Providers
| Method | Endpoint        | Description              |
|--------|-----------------|--------------------------|
| GET    | `/provider`     | Get all providers        |
| GET    | `/provider/:id` | Get provider by ID       |
| POST   | `/provider`     | Create provider          |
| PUT    | `/provider/:id` | Update provider (name, phone, shifts) |
| DELETE | `/provider/:id` | Delete provider          |

---

### Appointments
| Method | Endpoint                                      | Description                            |
|--------|-----------------------------------------------|----------------------------------------|
| GET    | `/appointment`                                | Get all appointments                   |
| GET    | `/appointment/:id`                            | Get appointment (with patient & provider) |
| GET    | `/appointment/patient/:id`                    | Get appointments for a patient         |
| GET    | `/appointment/provider/:id`                   | Get appointments for a provider        |
| GET    | `/appointment/slots/:providerId?date=YYYY-MM-DD` | Get occupied time slots for a provider on a date |
| POST   | `/appointment`                                | Create appointment                     |
| PUT    | `/appointment/:id`                            | Full update                            |
| PATCH  | `/appointment/:id`                            | Update status only                     |
| DELETE | `/appointment/:id`                            | Delete appointment                     |

---

### Admins
| Method | Endpoint      | Description       |
|--------|---------------|-------------------|
| GET    | `/admin`      | Get all admins    |
| GET    | `/admin/:id`  | Get admin by ID   |
| POST   | `/admin`      | Create admin      |
| PUT    | `/admin/:id`  | Update admin name |
| DELETE | `/admin/:id`  | Delete admin      |

---

### Video Call
| Method | Endpoint                                         | Description                  |
|--------|--------------------------------------------------|------------------------------|
| GET    | `/videocall/twilio?identity=X&room=Y`            | Get Twilio video access token|

---

## Authentication & Authorization

### Mechanism
JWT (JSON Web Tokens) with bcrypt password hashing.

### Login Flow
1. Client sends `POST /auth/login` with `{ email, password, role }`.
2. User is fetched from DB by email.
3. `bcrypt.compare()` validates the password.
4. JWT is signed with the following claims:
   - `id`, `email`, `isAdmin`
   - `aud`/`iss`: request hostname
   - `sub`: user ID
   - `exp`: 3 hours (`JWT_EXPIRATION`)
   - Algorithm: HS512
5. Returns `{ token, user: { id, email } }`.

### JWT Middleware
Defined in `src/middlewares/auth.ts`. Verifies the `Authorization: Bearer <token>` header, fetches the user from DB, and attaches it to the request.

> **Currently disabled** — the middleware is commented out in `src/routes/v1/index.ts`, meaning all routes are publicly accessible without a token.

### Password Hashing
bcrypt with 10 salt rounds, applied on both user creation and password updates.

---

## Data Flows

### Appointment Creation
```
POST /appointment { patientId, providerId, date, time, duration }
  → appointment controller
  → Prisma: create Appointment record
  → Email service: sendAppointmentCreationEmail()
      → Fetch patient name + provider name from DB
      → Read appointment_created.html template
      → Replace {{nombre}}, {{medico}}, {{fecha}} placeholders
      → Send via Gmail SMTP (nodemailer)
  → Return created appointment
```

### Slot Availability Check
```
GET /appointment/slots/:providerId?date=2024-06-10
  → Fetch provider + all appointments on that date
  → Determine day of week from date
  → Read provider.shifts[dayOfWeek].shifts (array of { from, to })
  → Generate all 5-minute slots within each shift window
  → Mark slots as occupied if an appointment falls within its time + duration
  → Return list of occupied slots
```

### Authentication
```
POST /auth/login { email, password, role }
  → Fetch user by email from DB
  → bcrypt.compare(password, user.password)
  → jwt.sign({ id, email, isAdmin }, JWT_SECRET, { algorithm: HS512, expiresIn: JWT_EXPIRATION })
  → Return { token, user: { id, email } }
```

---

## Email Notifications

Implemented in `src/email/index.ts` using **nodemailer** with Gmail SMTP.

**Triggered on:** Appointment creation (`POST /appointment`).

**Template variables in `appointment_created.html`:**
- `{{nombre}}` — Patient name
- `{{medico}}` — Provider name
- `{{fecha}}` — Appointment date

> **Warning:** Gmail credentials are currently hardcoded in `src/email/index.ts`. These should be moved to environment variables before any public deployment.

---

## Video Call Integration

Endpoint: `GET /videocall/twilio?identity=<username>&room=<roomName>`

Generates a Twilio Video **AccessToken** that the frontend uses to join a video room.

**Required env vars:**
- `TWILIO_ACCOUNT_SID`
- `TWILIO_API_KEY`
- `TWILIO_API_SECRET`

> Note: The main frontend (`sos`) uses **Jitsi Meet** instead of Twilio for video calls. This Twilio endpoint exists but is not actively used by the current frontends.

---

## Middleware Stack

Applied in order in `app.ts`:

1. **CORS** — Allows all origins (`cors()`)
2. **JSON body parser** — Parses `application/json` request bodies
3. **URL-encoded body parser** — Parses form-encoded bodies
4. **Morgan** — HTTP request logging to stdout
5. **Routes** — Mounted at `/api/v1`
6. **Auth middleware** *(disabled)* — JWT verification

---

## Known Issues & Notes

| Issue | Details |
|-------|---------|
| Auth not enforced | JWT middleware is commented out — all endpoints are public |
| Hardcoded email credentials | Gmail credentials in `src/email/index.ts` should be in `.env` |
| Weak JWT secret | `JWT_SECRET='sos'` — must be changed before any deployment |
| CORS open | Accepts requests from any origin |
| No input validation | No validation library (e.g. Zod, Joi) on request bodies |
| No error-handling middleware | Errors propagate without a global handler |
| No tests | `npm test` script exists but is empty |
| Twilio unused | Video call endpoint exists but frontends use Jitsi instead |
