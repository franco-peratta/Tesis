# sos — Documentation

Provider (doctor) web application for the **Salud Online Solidaria (SOS)** telemedicine platform. Doctors can view a statistics dashboard, manage patients and medical records, schedule appointments, conduct video consultations, and configure their availability schedule.

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
11. [Known Limitations](#known-limitations)

---

## Tech Stack

| Layer               | Technology                       | Version   |
|---------------------|----------------------------------|-----------|
| Framework           | React                            | 18.0.0    |
| Language            | TypeScript                       | ^4.4.2    |
| Build tool          | Create React App + Craco         | 5.0.0 / 6.4.3 |
| Routing             | React Router DOM                 | v6        |
| UI library          | Ant Design (antd)                | 4.22.8    |
| Styling             | LESS (via craco-less)            | —         |
| Markdown editor     | react-markdown-editor-lite       | 1.3.4     |
| Date handling       | moment                           | 2.29.2    |
| Auth storage        | react-cookie                     | 4.1.1     |
| Video calls         | Jitsi Meet (external CDN script) | —         |
| Animated counters   | react-countup                    | 6.5.3     |
| Forms               | react-hook-form                  | 7.56.1    |
| UUID generation     | uuid                             | 8.3.2     |
| Testing             | React Testing Library            | 12.0.0    |

> **Unused packages still in package.json:** `react-firebase-hooks`, `twilio-video`, `react-jutsu`, `react-quill`.

---

## Folder Structure

```
sos/
├── public/
│   ├── index.html                  # HTML shell — loads Jitsi Meet External API from CDN
│   └── img/sos-logo.png
├── src/
│   ├── index.tsx                   # Mounts <RootComponent />
│   ├── Init/
│   │   └── RootComponent.tsx       # Root router + Auth provider setup
│   ├── Auth/
│   │   ├── AuthContext.tsx         # Context: user state, signin, signout
│   │   ├── Login.tsx               # Login page
│   │   ├── useAuth.ts              # Convenience hook
│   │   └── index.tsx
│   ├── Dashboard/
│   │   ├── Dashboard.tsx           # Statistics overview page
│   │   ├── AnimatedStatistic.tsx   # Animated counter card
│   │   ├── Handler.ts              # API call: GET /stats
│   │   ├── types.ts                # Stats TypeScript interfaces
│   │   └── index.ts
│   ├── Patient/
│   │   ├── model.ts                # Patient interface
│   │   ├── Handler.tsx             # API calls: list, get, create, update
│   │   ├── Patients.tsx            # Patient list (searchable)
│   │   ├── PatientDetails.tsx      # Patient detail + appointments
│   │   ├── PatientForm.tsx         # New patient form
│   │   ├── routes.ts               # Route path constants
│   │   └── index.ts
│   ├── Appointments/
│   │   ├── model.ts                # Appointment interface + status enum
│   │   ├── Handler.ts              # API calls: get, create, delete, updateStatus
│   │   ├── Appointments.tsx        # Provider's appointment list
│   │   ├── NewAppointment.tsx      # Multi-step appointment creation wizard
│   │   ├── utils.ts                # Slot/time utilities
│   │   └── index.ts
│   ├── Videocall/
│   │   ├── Component.jsx           # Launches Jitsi, handles call lifecycle
│   │   ├── jitsi.jsx               # Jitsi Meet integration
│   │   ├── RightPanel.tsx          # Patient info + EMR editor during call
│   │   ├── route.ts
│   │   └── styles.css
│   ├── Profile/
│   │   ├── Model.ts                # Provider + Shift interfaces
│   │   ├── Handler.ts              # API calls: getProvider, updateProvider
│   │   ├── index.tsx               # Profile page
│   │   ├── ProfileForm.tsx         # Name/email/phone display
│   │   └── HoursOfOperations.tsx   # Weekly schedule editor
│   ├── EMR/
│   │   ├── model.ts
│   │   ├── EmrComponent.tsx        # Markdown EMR editor (react-markdown-editor-lite)
│   │   ├── Handler.ts              # API call: PATCH /patient/:id/emr
│   │   ├── EmrSettingsModal.tsx
│   │   └── index.ts
│   ├── components/
│   │   ├── routes.tsx              # All routes + RequireAuth guard
│   │   ├── Page.tsx                # Layout wrapper
│   │   ├── HeaderComponent.tsx     # Top nav (logo, links, avatar, logout)
│   │   ├── NotFoundPage.tsx
│   │   ├── Bubble/
│   │   └── Loader/
│   ├── UI/
│   │   ├── colors.ts
│   │   ├── useMediaQuery.tsx       # Responsive breakpoint hook (900px)
│   │   └── global_styles.less
│   ├── http/
│   │   └── index.ts                # Fetch wrapper — reads REACT_APP_API_URL, sends Bearer token
│   └── Notification/
│       └── index.ts                # Ant Design notification helpers
├── .env                            # Environment variables
├── craco.config.js                 # Ant Design theme overrides
├── package.json
├── tsconfig.json
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

# 2. Start dev server — opens http://localhost:3000
yarn start
```

### Scripts

| Script     | Command       | Description                    |
|------------|---------------|--------------------------------|
| `start`    | `yarn start`  | Dev server with hot reload     |
| `build`    | `yarn build`  | Production bundle → `build/`   |
| `test`     | `yarn test`   | Run tests                      |
| `prettier` | `yarn prettier` | Format all files             |

---

## Environment Variables

```env
# .env
REACT_APP_API_URL=http://localhost:5000/api/v1
```

The HTTP client reads `process.env.REACT_APP_API_URL` as the base URL. Change it to point to a different backend.

---

## Authentication

Sessions are stored in cookies. Every API call sends the token as a Bearer header.

### Flow
1. Doctor submits email + password on `/login`.
2. `POST /auth/login` with `role: "provider"`.
3. Backend returns `{ token, user: { id, email } }`.
4. `signin()` stores both in secure cookies (3-hour expiry).
5. On every API request, `src/http/index.ts` reads the token from cookies and adds `Authorization: Bearer <token>`.
6. `RequireAuth` redirects to `/login` if no user in context.

```ts
interface User { id: number; email: string }
const { user, signin, signout } = useAuth()
```

---

## Routes & Pages

> All paths are in Spanish.

| Path                        | Component        | Auth | Description                            |
|-----------------------------|------------------|------|----------------------------------------|
| `/login`                    | `Login`          | No   | Doctor login                           |
| `/`                         | → `/dashboard`   | Yes  | Redirects to dashboard                 |
| `/dashboard`                | `Dashboard`      | Yes  | Statistics overview                    |
| `/pacientes`                | `Patients`       | Yes  | Searchable patient list                |
| `/pacientes/nuevo`          | `PatientForm`    | Yes  | Create new patient                     |
| `/pacientes/:id`            | `PatientDetails` | Yes  | Patient detail + appointment history   |
| `/turnos`                   | `Appointments`   | Yes  | Provider's appointment list            |
| `/turnos/nuevo`             | `NewAppointment` | Yes  | Multi-step appointment creation wizard |
| `/videocall/:appointmentId` | `Videocall`      | Yes  | Video consultation room                |
| `/perfil/:id`               | `Profile`        | Yes  | Provider profile + schedule            |
| `*`                         | `NotFoundPage`   | Yes  | 404                                    |

---

## Features

### Dashboard (`/dashboard`)
Home screen after login. Fetches `GET /stats` and displays:
- Total patients, providers, appointments
- New patients last quarter
- Appointments by status: completed, pending, upcoming, completed last quarter
- All displayed as animated counters (`react-countup`)

### Appointment List (`/turnos`)
- Lists all appointments for the logged-in provider, filterable by status.
- Status color coding: `espera` → blue, `en_progreso` → yellow, `terminado` → green, `cancelado` → red.
- Actions: join call, delete, change status.

### New Appointment Wizard (`/turnos/nuevo`)
3-step form:
1. **Select patient** — search and pick from existing patients.
2. **Schedule** — select provider (defaults to logged-in doctor), date (past dates disabled), and time slot (filtered by provider shifts + occupied slots from API).
3. **Confirm** — review and submit. Backend sends email notification on creation.

### Patient Management (`/pacientes`, `/pacientes/:id`, `/pacientes/nuevo`)
- Searchable patient list.
- Patient detail page shows full info and all linked appointments.
- New patient form: name, DNI, email, phone, date of birth.

### Video Consultation (`/videocall/:appointmentId`)
- Loads Jitsi Meet via the CDN script in `public/index.html`.
- Room name = appointment ID, password = patient's DNI.
- Right panel shows patient info + live markdown EMR editor.
- On call end (`readyToClose`) → sets appointment to `terminado` → redirects to `/dashboard`.

### EMR Editor
- Markdown editor powered by `react-markdown-editor-lite`.
- Available on both `/pacientes/:id` and the video call right panel.
- Saved via `PATCH /patient/:id/emr`.

### Provider Profile (`/perfil/:id`)
- Name and email are **read-only**.
- Phone is editable.
- Weekly schedule: toggle day on/off, set up to 3 shift windows per day. Saved as JSON to `PUT /provider/:id`.

### Responsive Layout
- Header collapses to a hamburger drawer below 900px.

---

## Data Flows

### Login
```
POST /auth/login { email, password, role: "provider" }
  → { token, user }
  → cookies + AuthContext updated
  → redirect to /dashboard
```

### Create Appointment
```
Step 1: select patient (local state)
Step 2:
  GET /provider → list providers
  GET /appointment/slots/:providerId?date=... → occupied slots
  User picks slot
Step 3:
  POST /appointment { patientId, providerId, date, time, duration }
  → backend sends confirmation email
  → redirect to /turnos
```

### Video Call
```
GET /appointment/:id → load appointment + patient info
Jitsi room opens (name=appointmentId, password=patient.dni)
Doctor edits EMR → PATCH /patient/:id/emr
Call ends → PATCH /appointment/:id { status: "terminado" } → redirect to /dashboard
```

---

## API Endpoints Consumed

Base URL: `process.env.REACT_APP_API_URL`
All requests include `Authorization: Bearer <token>`.

| Method | Endpoint                                  | Description                        |
|--------|-------------------------------------------|------------------------------------|
| POST   | `/auth/login`                             | Authenticate doctor                |
| GET    | `/stats`                                  | Dashboard statistics               |
| GET    | `/patient`                                | List all patients                  |
| GET    | `/patient/:id`                            | Get patient by ID                  |
| GET    | `/patient/:id/appointments`               | Get patient with appointments      |
| POST   | `/patient`                                | Create patient                     |
| PUT    | `/patient/:id`                            | Update patient                     |
| PATCH  | `/patient/:id/emr`                        | Update EMR                         |
| GET    | `/appointment`                            | List all appointments              |
| GET    | `/appointment/:id`                        | Get appointment                    |
| GET    | `/appointment/provider/:id`               | Provider's appointments            |
| GET    | `/appointment/provider/:id?status=X`      | Filter by status (CSV)             |
| GET    | `/appointment/slots/:id?date=YYYY-MM-DD`  | Occupied time slots                |
| POST   | `/appointment`                            | Create appointment                 |
| PATCH  | `/appointment/:id`                        | Update status                      |
| DELETE | `/appointment/:id`                        | Delete appointment                 |
| GET    | `/provider`                               | List providers                     |
| GET    | `/provider/:id`                           | Get provider                       |
| PUT    | `/provider/:id`                           | Update provider                    |

---

## Key Design Decisions

- **Jitsi Meet:** Free, open-source, no account needed. Room = appointment ID, password = patient DNI.
- **react-markdown-editor-lite for EMR:** Replaced structured form fields after user testing feedback — doctors preferred free-form text.
- **Bearer token + cookies:** Token stored in cookie; sent as `Authorization` header on every request.
- **Spanish routes:** Consistent with the target Argentine audience.
- **Craco + LESS:** Ant Design theme overrides (`#1CB5E2` primary, `#002352` button) without ejecting from CRA.

---

## Known Limitations

| Area | Issue |
|------|-------|
| Appointment duration | Hardcoded to 30 min (WIP) |
| Profile name/email | Read-only — changing them would require re-issuing the auth cookie |
| Debug code | `alert("ENTREEEEE")` present in `Videocall/Component.jsx` |
| Unused deps | `react-firebase-hooks`, `twilio-video`, `react-jutsu`, `react-quill` |
| Mobile drawer | Hamburger menu content is placeholder text |
