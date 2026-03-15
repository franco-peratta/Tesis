# sos-patient — Documentation

Patient-facing web application for the **Salud Online Solidaria (SOS)** telemedicine platform. Patients can log in, view and create appointments, join video consultations, and manage their profile.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Folder Structure](#folder-structure)
3. [How to Run Locally](#how-to-run-locally)
4. [Environment Variables](#environment-variables)
5. [Authentication](#authentication)
6. [Routes & Pages](#routes--pages)
7. [Features](#features)
8. [Data Flows](#data-flows)
9. [API Endpoints Consumed](#api-endpoints-consumed)
10. [Key Design Decisions](#key-design-decisions)

---

## Tech Stack

| Layer         | Technology          | Version   |
|---------------|---------------------|-----------|
| Framework     | React               | 18.2.0    |
| Language      | TypeScript          | *         |
| Build tool    | Vite                | 4.2.0     |
| Routing       | React Router DOM    | 6.10.0    |
| UI library    | Ant Design (antd)   | 5.3.3     |
| Date handling | dayjs               | ^1.11.13  |
| Auth storage  | react-cookie        | 4.1.1     |
| Formatter     | Prettier            | ^2.8.7    |

---

## Folder Structure

```
sos-patient/
├── public/
│   └── img/sos-logo.png
├── src/
│   ├── main.tsx                    # Entry point — mounts <App />
│   ├── App.tsx                     # Root: Auth + Notification providers + Router
│   ├── App.css / index.css
│   ├── components/
│   │   ├── Routes.tsx              # Route definitions + RequireAuth guard
│   │   ├── Login.tsx               # Login / Register page
│   │   └── Page.tsx                # Shared layout: Header + Footer
│   ├── contexts/
│   │   ├── AuthContext.tsx         # User session state: signin, signout
│   │   └── NotificationContext.tsx # App-wide notification system
│   ├── hooks/
│   │   ├── useAuth.tsx             # Convenience hook for AuthContext
│   │   └── useNotifications.tsx    # Convenience hook for NotificationContext
│   ├── http/
│   │   └── index.ts                # Fetch wrapper — reads VITE_API_URL, sends Bearer token
│   ├── Appointments/
│   │   ├── Component.tsx           # Appointments list page
│   │   ├── AppointmentCard.tsx     # Individual appointment card
│   │   ├── NewAppointment.tsx      # New appointment form
│   │   ├── handler.ts              # API calls for appointments
│   │   ├── model.ts                # Appointment interface
│   │   ├── utils.ts                # Helpers
│   │   └── index.ts
│   ├── Patient/
│   │   ├── Profile.tsx             # View profile page
│   │   ├── EditProfile.tsx         # Edit profile page
│   │   ├── handler.ts              # API calls: getPatientById, updatePatient
│   │   ├── model.ts                # Patient interface
│   │   └── index.ts
│   └── Provider/
│       └── model.ts                # Provider interface
├── .env                            # Environment variables
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── yarn.lock
```

---

## How to Run Locally

### Prerequisites
- Node.js (v16+)
- Yarn or npm
- `sos-back` running (see its DOCUMENTATION.md)

### Steps

```bash
# 1. Install dependencies
yarn install

# 2. Start dev server — opens http://localhost:5173
yarn dev
```

### Scripts

| Script          | Command        | Description                        |
|-----------------|----------------|------------------------------------|
| `dev` / `start` | `yarn dev`     | Dev server with hot reload         |
| `build`         | `yarn build`   | Production bundle                  |
| `preview`       | `yarn preview` | Serve the production build locally |
| `lint`          | `yarn lint`    | Run ESLint                         |

---

## Environment Variables

```env
# .env
VITE_ENV=local
VITE_API_URL=http://localhost:5000/api/v1
```

The HTTP client reads `import.meta.env.VITE_API_URL` as the base URL. Change it to point to a different backend.

---

## Authentication

Sessions are stored in cookies. Every API call sends the token as a Bearer header.

### Flow
1. Patient submits email + password (or registers) on `/login`.
2. `POST /auth/login` with `role: "patient"`.
3. Backend returns `{ token, user: { id, email } }`.
4. `signin()` stores both in cookies (3-hour expiry, `SameSite: true`, `Secure: true`).
5. On every API request, `src/http/index.ts` reads the token and adds `Authorization: Bearer <token>`.
6. `RequireAuth` redirects to `/login` if no user in context.

```ts
interface User { id: number; email: string }
const { user, signin, signout } = useAuth()
```

---

## Routes & Pages

| Path            | Component        | Auth | Description                    |
|-----------------|------------------|------|--------------------------------|
| `/login`        | `Login`          | No   | Login or register              |
| `/`             | `Appointments`   | Yes  | Patient's appointment list     |
| `/turnos/nuevo` | `NewAppointment` | Yes  | Create a new appointment       |
| `/profile`      | `Profile`        | Yes  | View patient profile           |
| `/profile/edit` | `EditProfile`    | Yes  | Edit patient information       |
| `*`             | 404 fallback     | Yes  | Catch-all                      |

---

## Features

### Login / Register (`/login`)
- **Login:** email + password with `role: "patient"`.
- **Register:** name, DNI, date of birth, phone, email, password.
- Toggles between both modes on the same page.

### Appointments List (`/`)
- Fetches all appointments for the logged-in patient.
- Each card shows: date/time, doctor name, status badge.
- **Join call** (phone icon, tooltip "Iniciar llamada?"): sets status to `en_progreso`, opens Jit.si video call in a new tab. Available for `espera` and `en_progreso` appointments.
- **Cancel** (X icon, tooltip "Cancelar turno?"): sets status to `cancelado`. Disabled for `terminado` or already `cancelado`.
- **"Crear turno"** button navigates to `/turnos/nuevo`.

### New Appointment (`/turnos/nuevo`)
- Patient selects provider, date, and available time slot.
- Submits to `POST /appointment`.

### Profile (`/profile`)
- Displays: Name, DNI, Email, Phone, Date of Birth.
- "Editar" navigates to `/profile/edit`.

### Edit Profile (`/profile/edit`)
- Pre-filled form with current data.
- Editable: Name, DNI, Phone, Date of Birth.
- On submit: `PUT /patient/:id` → redirect to `/profile`.

### Notifications
- App-wide via `NotificationContext` — used for success/error feedback on all actions.

---

## Data Flows

### Login
```
POST /auth/login { email, password, role: "patient" }
  → { token, user }
  → cookies + AuthContext updated
  → redirect to /
```

### Appointments
```
Component mounts
  → GET /appointment/patient/:patientId
  → renders appointment cards

Join call:
  → PATCH /appointment/:id { status: "en_progreso" }
  → open https://meet.jit.si/<appointmentId>

Cancel:
  → PATCH /appointment/:id { status: "cancelado" }
  → success notification
```

### Edit Profile
```
Component mounts
  → GET /patient/:id → pre-fills form

Submit:
  → PUT /patient/:id { name, dni, phone, dob }
  → redirect to /profile
```

---

## API Endpoints Consumed

Base URL: `import.meta.env.VITE_API_URL`
All authenticated requests include `Authorization: Bearer <token>`.

| Method  | Endpoint                          | Description                    |
|---------|-----------------------------------|--------------------------------|
| POST    | `/auth/login`                     | Authenticate patient           |
| POST    | `/auth/register`                  | Register new patient           |
| GET     | `/appointment/patient/:id`        | Fetch patient's appointments   |
| PATCH   | `/appointment/:id`                | Update appointment status      |
| POST    | `/appointment`                    | Create new appointment         |
| GET     | `/patient/:id`                    | Fetch patient details          |
| PUT     | `/patient/:id`                    | Update patient profile         |

---

## Key Design Decisions

- **Vite over CRA:** Faster dev server and builds than the doctor app (`sos`).
- **Bearer token + cookies:** Token stored in cookie; sent as `Authorization` header on every request.
- **Jit.si for video:** Open-source, no account needed. Room name = appointment ID.
- **Ant Design:** All UI components for fast, consistent development.
- **3-hour cookie expiry:** Short-lived sessions for security in a healthcare context.
