# sos-patient — Documentation

Patient-facing web application for the **Salud Online Solidaria (SOS)** telemedicine platform. Patients can log in, view and manage their appointments, join video consultations, and edit their profile.

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

| Layer         | Technology                        | Version   |
|---------------|-----------------------------------|-----------|
| Framework     | React                             | 18.2.0    |
| Language      | TypeScript                        | Latest    |
| Build tool    | Vite                              | 4.2.0     |
| Routing       | React Router DOM                  | 6.10.0    |
| UI library    | Ant Design (antd)                 | 5.3.3     |
| Date handling | dayjs                             | 1.11.7    |
| Auth storage  | react-cookie                      | 4.1.1     |
| Linting       | ESLint + Prettier                 | 2.8.7     |

---

## Folder Structure

```
sos-patient/
├── public/
│   └── img/sos-logo.png            # App logo
├── src/
│   ├── main.tsx                    # Entry point — mounts <App />
│   ├── App.tsx                     # Root: wraps providers (Auth, Notifications, Router)
│   ├── App.css / index.css         # Global styles
│   │
│   ├── components/
│   │   ├── Routes.tsx              # Route definitions + auth guard (RequireAuth)
│   │   ├── Login.tsx               # Login / Register page
│   │   └── Page.tsx                # Shared layout: Header + Footer wrapper
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx         # Stores user session, signin/signout methods
│   │   └── NotificationContext.tsx # App-wide notification system
│   │
│   ├── hooks/
│   │   ├── useAuth.tsx             # Convenience hook for AuthContext
│   │   └── useNotifications.tsx    # Convenience hook for NotificationContext
│   │
│   ├── http/
│   │   └── index.ts                # Generic HTTP client (fetch wrapper)
│   │
│   ├── Appointments/
│   │   ├── Component.tsx           # Appointments list page
│   │   ├── AppointmentCard.tsx     # Individual appointment card
│   │   ├── handler.ts              # API calls: getAppointmentsByPatientId, updateAppointment
│   │   ├── model.ts                # Appointment TypeScript interface
│   │   ├── utils.ts                # Helpers (e.g. status label formatting)
│   │   └── index.ts                # Module re-exports
│   │
│   ├── Patient/
│   │   ├── Profile.tsx             # View profile page
│   │   ├── EditProfile.tsx         # Edit profile page
│   │   ├── handler.ts              # API calls: getPatientById, updatePatient
│   │   ├── model.ts                # Patient TypeScript interface
│   │   └── index.ts                # Module re-exports
│   │
│   └── Provider/
│       └── model.ts                # Provider (doctor) TypeScript interface
│
├── index.html                      # HTML shell — single div#root
├── vite.config.ts                  # Vite config (React plugin)
├── tsconfig.json                   # TypeScript config (strict, ESNext)
├── package.json
└── yarn.lock
```

---

## How to Run Locally

### Prerequisites
- Node.js (v16+ recommended)
- Yarn or npm
- The `sos-back` API running on `http://localhost:5000`

### Steps

```bash
# 1. Install dependencies
yarn install

# 2. Start development server (hot reload on http://localhost:5173)
yarn dev
```

### Available Scripts

| Script          | Command         | Description                        |
|-----------------|-----------------|------------------------------------|
| `dev` / `start` | `yarn dev`      | Start Vite dev server with HMR     |
| `build`         | `yarn build`    | Compile TypeScript + bundle        |
| `preview`       | `yarn preview`  | Serve the production build locally |
| `lint`          | `yarn lint`     | Run ESLint checks                  |

---

## Environment Variables

There is **no `.env` file** — the backend URL is hardcoded in `src/http/index.ts`:

```ts
const domain = "http://localhost:5000/api/v1"
```

To point to a different backend, change that constant directly.

---

## Authentication

Authentication is **cookie-based**, managed through `AuthContext`.

### Session Storage
- On login, the API returns `{ token, user: { id, email } }`.
- `signin()` stores:
  - `token` cookie
  - `user` cookie (base64-encoded JSON)
- Cookies are set with `SameSite: true`, `Secure: true`, and a **3-hour expiration**.
- `signout()` removes both cookies and clears context state.

### Route Protection
The `RequireAuth` component (in `Routes.tsx`) wraps all authenticated routes:
- If no user in context → redirect to `/login`, preserving the originally requested URL.
- After login, the user is redirected back to the original destination.

### User Interface
```ts
interface User {
  id: number
  email: string
}
```

---

## Routes & Pages

| Path            | Component      | Auth Required | Description                        |
|-----------------|----------------|---------------|------------------------------------|
| `/login`        | `Login`        | No            | Login or create a new account      |
| `/`             | `Appointments` | Yes           | List of patient's appointments     |
| `/profile`      | `Profile`      | Yes           | View patient profile               |
| `/profile/edit` | `EditProfile`  | Yes           | Edit patient information           |
| `*`             | 404 fallback   | Yes           | Catch-all for unknown routes       |

---

## Features

### 1. Login / Register
- **Login:** email + password, submits with `role: "patient"`.
- **Register:** name, DNI, date of birth, phone, email, password.
- Toggles between both modes on the same page.

### 2. Appointments List (`/`)
- Fetches all appointments for the logged-in patient.
- Each card shows:
  - Appointment ID and date/time
  - Doctor (provider) name
  - Status badge: `espera`, `en_progreso`, `terminado`, `cancelado`
- **"Unirse" (Join):** Sets status to `en_progreso`, then opens a Jit.si video call in a new tab (meeting ID derived from appointment ID).
- **"Cancelar" (Cancel):** Sets status to `cancelado`. Disabled for already-finished or cancelled appointments.

### 3. Patient Profile (`/profile`)
- Displays: Name, DNI, Email, Phone, Date of Birth.
- "Editar" button navigates to the edit page.

### 4. Edit Profile (`/profile/edit`)
- Pre-populated form with current patient data.
- Editable fields: Name, DNI, Phone, Date of Birth.
- On submit: calls `PUT /patient/:id`, then redirects back to `/profile`.

### 5. Notifications
- App-wide notification system via `NotificationContext`.
- Used for success/error feedback on actions (cancel appointment, save profile, etc.).

---

## Data Flows

### Login Flow
```
User fills login form
  → POST /auth/login { email, password, role: "patient" }
  → Response: { token, user: { id, email } }
  → signin() → stores cookies → updates AuthContext
  → Redirect to / (or originally requested URL)
```

### Appointments Flow
```
Component mounts (/)
  → GET /appointment/patient/:patientId
  → Renders list of AppointmentCards

User clicks "Unirse"
  → PATCH /appointment/:id { status: "en_progreso" }
  → Opens https://meet.jit.si/<appointmentId> in new tab

User clicks "Cancelar"
  → PATCH /appointment/:id { status: "cancelado" }
  → Shows success notification → re-renders list
```

### Profile Edit Flow
```
Component mounts (/profile/edit)
  → GET /patient/:patientId → pre-fills form

User submits form
  → PUT /patient/:patientId { name, dni, phone, dob }
  → Redirects to /profile
```

---

## API Endpoints Consumed

Base URL: `http://localhost:5000/api/v1`

| Method  | Endpoint                          | Description                        |
|---------|-----------------------------------|------------------------------------|
| `POST`  | `/auth/login`                     | Authenticate patient               |
| `POST`  | `/auth/register`                  | Register new patient account       |
| `GET`   | `/appointment/patient/:patientId` | Fetch all appointments for patient |
| `PATCH` | `/appointment/:appointmentId`     | Update appointment status          |
| `GET`   | `/patient/:patientId`             | Fetch patient details              |
| `PUT`   | `/patient/:patientId`             | Update patient profile             |

The HTTP client (`src/http/index.ts`) is a thin wrapper around `fetch` supporting GET, POST, PUT, PATCH, and DELETE with JSON bodies.

---

## Key Design Decisions

- **No auth headers:** HTTP requests rely on cookies for authentication rather than `Authorization: Bearer` headers.
- **React Context only:** No Redux or external state library — auth and notifications are managed with context + local state.
- **Jit.si for video:** Fully open-source, no account required, launches directly in the browser. Meeting room name is derived from the appointment ID.
- **Ant Design:** Provides all UI components (forms, cards, dropdowns, notifications) for rapid, consistent UI development.
- **Spanish UI:** All labels, statuses, and messages are in Spanish to serve the target Argentine patient population.
- **Cookie expiry = 3 hours:** Sessions are intentionally short-lived for security in a healthcare context.
