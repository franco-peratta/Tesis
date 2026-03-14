# sos — Documentation

Provider (doctor) web application for the **Salud Online Solidaria (SOS)** telemedicine platform. Doctors can manage patients and their medical records, schedule and handle appointments, conduct video consultations, and configure their availability schedule.

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

| Layer           | Technology                       | Version   |
|-----------------|----------------------------------|-----------|
| Framework       | React                            | 18.0.0    |
| Language        | TypeScript                       | 4.4.2     |
| Build tool      | Create React App + Craco         | 5.0.0 / 6.4.3 |
| Routing         | React Router DOM                 | v6        |
| UI library      | Ant Design (antd)                | 4.22.8    |
| Styling         | LESS (via craco-less)            | —         |
| Rich text editor| react-quill                      | 2.0.0     |
| Date handling   | moment                           | 2.29.2    |
| Auth storage    | react-cookie                     | 4.1.1     |
| Video calls     | Jitsi Meet (external CDN script) | —         |
| UUID generation | uuid                             | 8.3.2     |
| Testing         | React Testing Library            | 12.0.0    |

---

## Folder Structure

```
sos/
├── public/
│   ├── index.html              # HTML shell — loads Jitsi Meet External API from CDN
│   └── img/sos-logo.png        # App logo
├── src/
│   ├── index.tsx               # Mounts <RootComponent />
│   ├── Init/
│   │   └── RootComponent.tsx   # Root router setup + wraps Auth provider
│   │
│   ├── Auth/
│   │   ├── AuthContext.tsx     # Context: user state, signin, signout
│   │   ├── Login.tsx           # Login page
│   │   ├── useAuth.ts          # Convenience hook
│   │   └── index.tsx           # Exports
│   │
│   ├── Patient/
│   │   ├── model.ts            # Patient TypeScript interface
│   │   ├── Handler.tsx         # API calls: getPatients, getPatientById, createPatient, updatePatient
│   │   ├── Patients.tsx        # Patient list page (searchable)
│   │   ├── PatientDetails.tsx  # Single patient detail + appointments
│   │   ├── PatientForm.tsx     # New patient form
│   │   ├── routes.ts           # Route path constants
│   │   └── index.ts            # Exports
│   │
│   ├── Appointments/
│   │   ├── model.ts            # Appointment interface + status enum
│   │   ├── Handler.ts          # API calls: get, create, delete, updateStatus
│   │   ├── Appointments.tsx    # Provider's appointment list
│   │   ├── NewAppointment.tsx  # Multi-step appointment creation wizard
│   │   ├── utils.ts            # Slot/time utilities
│   │   └── index.ts            # Exports
│   │
│   ├── Videocall/
│   │   ├── Component.jsx       # Video call orchestrator (launches Jitsi)
│   │   ├── jitsi.jsx           # Jitsi Meet integration component
│   │   ├── RightPanel.tsx      # Sidebar during call: patient info + EMR editor
│   │   ├── route.ts            # Route config
│   │   └── styles.css
│   │
│   ├── Profile/
│   │   ├── Model.ts            # Provider + Shift interfaces
│   │   ├── Handler.ts          # API calls: getProvider, updateProvider
│   │   ├── index.tsx           # Profile page wrapper
│   │   ├── ProfileForm.tsx     # Display name, email, phone (name/email read-only)
│   │   └── HoursOfOperations.tsx # Weekly schedule editor
│   │
│   ├── EMR/
│   │   ├── model.ts            # EMR type definitions
│   │   ├── EMR.tsx             # Rich text EMR editor (react-quill)
│   │   ├── Handler.ts          # API call: updateEMR
│   │   ├── EmrSettingsModal.tsx# EMR settings modal
│   │   └── index.ts            # Exports
│   │
│   ├── components/
│   │   ├── routes.tsx          # All route definitions + RequireAuth guard
│   │   ├── Page.tsx            # Layout wrapper (header + content)
│   │   ├── HeaderComponent.tsx # Top nav: logo, menu links, avatar, logout
│   │   ├── NotFoundPage.tsx    # 404 page
│   │   ├── Bubble/             # Styled container component
│   │   └── Loader/             # Loading spinner components
│   │
│   ├── UI/
│   │   ├── colors.ts           # Color constants
│   │   ├── RichTextEditor.tsx  # react-quill wrapper
│   │   ├── useMediaQuery.tsx   # Responsive breakpoint hook
│   │   └── global_styles.less  # Global LESS styles
│   │
│   ├── http/
│   │   └── index.ts            # Generic fetch wrapper (GET/POST/PUT/PATCH/DELETE)
│   │
│   └── Notification/
│       └── index.ts            # Ant Design notification helpers
│
├── craco.config.js             # Ant Design theme customization
├── package.json
├── tsconfig.json
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

# 2. Start development server (opens http://localhost:3000)
yarn start
```

### Available Scripts

| Script     | Command          | Description                        |
|------------|------------------|------------------------------------|
| `start`    | `yarn start`     | Dev server with hot reload         |
| `build`    | `yarn build`     | Production bundle to `build/`      |
| `test`     | `yarn test`      | Run React Testing Library tests    |
| `prettier` | `yarn prettier`  | Format all files with Prettier     |

---

## Environment Variables

There is **no `.env` file** — the backend URL is hardcoded in `src/http/index.ts`:

```ts
const domain = "http://localhost:5000/api/v1"
```

To change the backend URL, edit that constant directly.

---

## Authentication

Cookie-based JWT authentication via React Context.

### Flow
1. Doctor submits email + password on `/login`.
2. Sends `POST /auth/login` with `role: "provider"`.
3. Backend returns `{ token, user: { id, email } }`.
4. `signin()` stores both in secure cookies (3-hour expiry, `SameSite`, `Secure`).
5. `AuthContext` exposes `user`, `signin`, and `signout` to the whole app.
6. `RequireAuth` in `routes.tsx` redirects to `/login` if no user is found in context.

### User interface
```ts
interface User {
  id: number
  email: string
}
```

### Hooks
```ts
const { user, signin, signout } = useAuth()
```

---

## Routes & Pages

| Path                          | Component          | Auth Required | Description                              |
|-------------------------------|--------------------|---------------|------------------------------------------|
| `/login`                      | `Login`            | No            | Doctor login                             |
| `/`                           | `Appointments`     | Yes           | Provider's appointment list              |
| `/patients`                   | `Patients`         | Yes           | Searchable patient list                  |
| `/patients/new`               | `PatientForm`      | Yes           | Create new patient                       |
| `/patients/:id`               | `PatientDetails`   | Yes           | Patient details + appointment history    |
| `/appointments/new`           | `NewAppointment`   | Yes           | Multi-step appointment creation wizard   |
| `/videocall/:appointmentId`   | `Videocall`        | Yes           | Video consultation room                  |
| `/profile`                    | `Profile`          | Yes           | Provider profile + schedule management   |
| `*`                           | `NotFoundPage`     | Yes           | 404                                      |

---

## Features

### 1. Login
- Email + password form.
- Authenticates with `role: "provider"`.
- Stores token and user in cookies on success.

### 2. Appointment List (`/`)
- Lists all appointments for the logged-in provider.
- Displays: patient name, date, time, duration, status badge.
- Status color coding:
  - `espera` → blue (waiting)
  - `en_progreso` → orange (in progress)
  - `terminado` → green (completed)
  - `cancelado` → red (cancelled)
- Actions: join call, delete, change status.

### 3. New Appointment Wizard (`/appointments/new`)
A 3-step form:

**Step 1 — Select patient**
- Search and select from existing patients.
- Or create a new one on the fly.

**Step 2 — Schedule**
- Select provider (defaults to logged-in doctor).
- Pick a date (past dates disabled).
- Time slot picker filtered by:
  - Provider's configured shifts for that day.
  - Already-occupied slots (fetched from `/appointment/slots/:id?date=...`).
- Duration selector (currently fixed at 30 min).

**Step 3 — Review & confirm**
- Summary of all selections before creation.
- On confirm: creates appointment → sends email notification → redirects.

### 4. Patient List (`/patients`)
- Full list of all patients.
- Search by name (client-side filter).
- Links to individual patient detail pages.

### 5. Patient Details (`/patients/:id`)
- Displays: name, DNI, date of birth, phone, email.
- Shows all appointments linked to that patient.
- Links to start a video call for any appointment.

### 6. New Patient Form (`/patients/new`)
- Fields: name, DNI, email, phone, date of birth.
- Submits to `POST /patient`.

### 7. Video Consultation (`/videocall/:appointmentId`)
The telemedicine core feature.

- Loads the **Jitsi Meet External API** (injected via `<script>` in `public/index.html`).
- Joins a Jitsi room named after the appointment ID.
- Room password = patient's DNI (for basic security).
- **Right panel** is shown alongside the video:
  - Patient name and basic info.
  - Full **EMR editor** (react-quill rich text) — editable live during the call.
  - Save EMR button.
- On call end (`readyToClose` event) → marks appointment as `terminado`.

### 8. Electronic Medical Records (EMR)
- Rich text editor powered by **react-quill**.
- Supports bold, italic, underline, lists, links, images, video embeds.
- Editable from both the patient detail page and the video call right panel.
- Saved with `PATCH /patient/:id/emr`.

### 9. Provider Profile (`/profile`)
- **Basic info:** Name (read-only), Email (read-only), Phone (editable).
- **Hours of operation:** Weekly schedule editor.
  - Toggle each day on/off.
  - Add up to 3 shift windows per day (e.g. 08:00–12:00, 14:00–18:00).
  - Saved as JSON to `PUT /provider/:id`.

### 10. Responsive Layout
- Header collapses to a hamburger drawer below 900px.
- Ant Design grid system adapts all pages for mobile/tablet.

---

## Data Flows

### Login
```
User submits /login form
  → POST /auth/login { email, password, role: "provider" }
  → Response: { token, user: { id, email } }
  → signin() → stores cookies → updates AuthContext
  → Redirect to /
```

### Create Appointment (wizard)
```
Step 1: select patient (local state)
Step 2:
  → GET /provider (list all providers)
  → GET /appointment/slots/:providerId?date=YYYY-MM-DD (occupied slots)
  → User picks date + available time slot
Step 3: confirm
  → POST /appointment { patientId, providerId, date, time, duration }
  → Email sent by backend
  → Redirect to /
```

### Video Call
```
Navigate to /videocall/:appointmentId
  → GET /appointment/:id (fetch appointment with patient & provider)
  → Jitsi Meet loads in iframe
  → Room name = appointmentId, password = patient.dni
  → Right panel shows patient info + EMR editor
  → Doctor edits EMR → PATCH /patient/:id/emr { emr: "<rich text>" }
  → Call ends (readyToClose event)
    → PATCH /appointment/:id { status: "terminado" }
    → Redirect to /
```

### Update Provider Schedule
```
/profile → HoursOfOperations component
  → GET /provider/:id (load current shifts)
  → Doctor edits day availability + shift windows
  → PUT /provider/:id { shifts: { monday: {...}, tuesday: {...}, ... } }
```

---

## API Endpoints Consumed

Base URL: `http://localhost:5000/api/v1`

| Method  | Endpoint                                     | Description                            |
|---------|----------------------------------------------|----------------------------------------|
| POST    | `/auth/login`                                | Authenticate doctor                    |
| GET     | `/patient`                                   | List all patients                      |
| GET     | `/patient/:id`                               | Get patient by ID                      |
| GET     | `/patient/:id/appointments`                  | Get patient with appointments          |
| POST    | `/patient`                                   | Create patient                         |
| PUT     | `/patient/:id`                               | Update patient info                    |
| PATCH   | `/patient/:id/emr`                           | Update patient EMR                     |
| GET     | `/appointment`                               | List all appointments                  |
| GET     | `/appointment/:id`                           | Get single appointment                 |
| GET     | `/appointment/provider/:id`                  | Get appointments for provider          |
| GET     | `/appointment/slots/:id?date=YYYY-MM-DD`     | Get occupied time slots                |
| POST    | `/appointment`                               | Create appointment                     |
| PATCH   | `/appointment/:id`                           | Update appointment status              |
| DELETE  | `/appointment/:id`                           | Delete appointment                     |
| GET     | `/provider`                                  | List all providers                     |
| GET     | `/provider/:id`                              | Get provider profile                   |
| PUT     | `/provider/:id`                              | Update provider (name, phone, shifts)  |

---

## Key Design Decisions

- **Jitsi Meet over Twilio:** Jitsi is free, open-source, and requires no account. It runs directly in the browser with no plugins. Room names are appointment IDs; passwords are patient DNIs.
- **react-quill for EMR:** Gives doctors full formatting freedom instead of rigid form fields — validated by user testing feedback.
- **Cookie auth (no Authorization header):** Consistent with the patient app; the token is stored in a cookie rather than sent manually in headers.
- **LESS + Craco:** Allows Ant Design theme overrides (primary color `#1CB5E2`, button color `#002352`) without ejecting from Create React App.
- **Module pattern:** Each feature (Patient, Appointments, Videocall, etc.) is self-contained with its own `model.ts`, `Handler.ts`, components, and `index.ts`.
- **Spanish UI:** All labels and statuses are in Spanish for the Argentine target users.

---

## Known Limitations

| Area              | Issue                                                                 |
|-------------------|-----------------------------------------------------------------------|
| EMR fields        | Earlier version used structured fields; replaced with rich text after user testing |
| Appointment duration | Hardcoded to 30 minutes (WIP)                                    |
| Profile edit      | Name and email are read-only; changing them would require re-issuing the auth cookie |
| Twilio code       | `src/Videocall/Twillio/` directory exists but is unused              |
| Debug code        | `alert("ENTREEEEE")` present in `Videocall/Component.jsx`            |
| Mobile header     | Hamburger drawer content is a placeholder ("Some contents...")       |
| No .env support   | Backend URL hardcoded — must be changed manually for different environments |
| firebase-hooks dep | Installed but unused in current code                                |
