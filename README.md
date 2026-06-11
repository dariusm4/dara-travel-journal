# Dara — Travel Journal & AI Companion 🌍

Dara is a mobile travel journal built with **React Native (Expo)** and a small
**Node + SQLite backend**. You record **trips** and the **entries** within them —
each entry can carry a photo, your GPS location (auto-resolved to a place name
and weather), and a note. An **AI travel companion** chats with you and turns a
trip's entries into a written "trip story". Sign in on any device with the
same account and your journal comes with you.

> Course project for _Mobile Programming — Laboratory_. Built against the full
> grading rubric (see [`docs/Project-Criteria.md`](docs/Project-Criteria.md)):
> all 15 base criteria plus all four extended criteria (A–D).

## Architecture at a glance

```
┌──────────────────────┐       HTTPS / HTTP-on-LAN       ┌────────────────────────┐
│  Expo / React Native │ ──────────────────────────────► │  Local Express server  │
│   (Expo Go or APK)   │   /auth, /trips, /entries,      │   (Node 20 + SQLite)   │
│                      │   /photos, /ai, /api/*          │  data/dara.db          │
│ Redux Toolkit + UI   │ ◄────────────────────────────── │  data/photos/<uuid>.jpg│
└──────────────────────┘       JWT (Bearer)              └────────────────────────┘
                                                         OPENAI / OPENWEATHER /
                                                         UNSPLASH / EXCHANGERATE
```

- **No third-party BaaS** — the rubric explicitly lists "Express + Postgres" as
  a valid backend (criterion A); we use SQLite for simplicity.
- **No keys live in the app.** OpenAI / OpenWeather / Unsplash / exchangerate
  keys all sit in the backend's `.env`. The app only knows `EXPO_PUBLIC_API_URL`.
- **No backend deploy.** The backend runs locally during dev and the demo;
  only the **app** is built with EAS for criterion 15.

## Features

- 📓 **Trips → Entries** journal with photos, notes, dates, locations, weather
- 🔐 **Accounts** — email/password (bcrypt + JWT); each user sees only their own data
- ☁️ **Server-backed sync** — entries survive reinstall and travel across devices
- 📷 **Camera & gallery** photos uploaded to the server · 📍 **GPS** with reverse geocoding
- 🌤️ **Weather** on entries, 🖼️ **Unsplash** cover suggestions, 💱 **currency converter**
- 🤖 **AI companion** — chat + auto-generated trip stories (OpenAI, proxied)
- 🔔 **Local reminders**, 📊 travel **stats** (trips / places / days)
- 📴 **Offline-friendly** — previously loaded data stays readable without a connection
- ✨ Reanimated entrance animations, swipe-to-delete, and haptics

## Tech stack

| Area      | Choice                                                                         |
| --------- | ------------------------------------------------------------------------------ |
| App       | Expo (managed) + React Native, **TypeScript**, Expo Router (tabs+stack+modal)  |
| State     | **Redux Toolkit** + typed hooks                                                |
| Backend   | **Express 5** + **TypeScript**, **better-sqlite3**, bcryptjs, JWT, multer, zod |
| Externals | OpenAI, OpenWeatherMap, Unsplash, exchangerate-api (all proxied)               |
| Native    | image-picker, location, secure-store, haptics, notifications                   |
| UX        | Reanimated, Gesture Handler, NetInfo                                           |
| Quality   | ESLint + Prettier, Jest + React Native Testing Library                         |

### Why Redux Toolkit?

Several pieces of genuinely global state (auth/session, the user's trips and
entries, network status) are read by many distant screens. Redux Toolkit gives
one predictable store with low boilerplate; sync hooks dispatch the backend
results into slices so the UI always reads from a single source of truth.
Screen-local state (form fields, open modals) stays in `useState`.

## Project structure

```
app/            # Expo Router routes (screens & layouts)
components/     # reusable presentational components (ui/, journal/)
constants/      # theme.ts (design tokens), Colors.ts
store/          # Redux Toolkit store, slices, typed hooks
services/       # api client, auth, journal, ai, weather, unsplash, exchange...
hooks/          # custom hooks (useTheme, useAuth, sync hooks, ...)
types/          # shared domain models (Trip, Entry, ...)
utils/          # pure helpers (dates, validation, currency, stats)
server/         # local Express + SQLite backend (own package.json, own .env)
docs/           # project criteria
```

## Getting started

**Prerequisites:** Node 20+, npm, the [Expo Go](https://expo.dev/go) app (or an
Android/iOS emulator). The app and the backend both run on your dev machine.

### 1) Start the backend

```bash
cd server
npm install
cp .env.example .env             # fill in JWT_SECRET and the API keys you want
npm run dev                      # tsx watch → prints http://localhost:4000
                                 # and the LAN URLs (e.g. http://192.168.x.x:4000)
```

The backend creates `server/data/dara.db` (SQLite) and `server/data/photos/`
on first boot. Both are gitignored.

### 2) Configure the app

```bash
cd ..                             # back to repo root
npm install
cp .env.example .env              # fill in EXPO_PUBLIC_API_URL
```

`EXPO_PUBLIC_API_URL` depends on **where you run the app**:

| Run target                        | URL                                                          |
| --------------------------------- | ------------------------------------------------------------ |
| iOS simulator                     | `http://localhost:4000`                                      |
| Android emulator                  | `http://10.0.2.2:4000`                                       |
| Physical phone / Expo Go on Wi-Fi | `http://<your-LAN-IP>:4000` (from the backend's startup log) |

### 3) Run the app

```bash
npm start                         # scan the QR with Expo Go, or press a / i
```

Register an account from the **Sign up** screen and you're in.

## Demo: prove "data survives reinstall" (criterion A)

1. Register, create a trip + entry with a photo, log out.
2. **Uninstall the app** (or clear app storage).
3. Reinstall and log in — your trip, entry, and photo all come back from the
   backend (Firestore-style persistence, no third-party service).

## Scripts

```bash
npm start          # Expo dev server
npm run android    # open on Android
npm run ios        # open on iOS (macOS)
npm test           # run the Jest test suite (44 tests)
npm run lint       # ESLint
npm run format     # Prettier --write
```

Server-side (`cd server`):

```bash
npm run dev        # tsx watch (auto-reload)
npm run build      # tsc → dist/
npm start          # node dist/index.js (after build)
```

## Testing

Jest + React Native Testing Library (`npm test`). 44 tests cover pure logic
(date / validation / currency / stats helpers), Redux slices, store wiring,
and component behavior (Button, EmptyState).

## Building a preview APK (criterion 15)

The app builds with **EAS Build** (profiles in `eas.json`):

```bash
npm i -g eas-cli
eas login
eas build:configure                                # one-time
eas build --platform android --profile preview
```

Replace the placeholder app icon and splash image in `assets/images/` (a
1024×1024 source works with Expo's generator) before submitting.

## Security notes (criterion 14)

- The auth session token (JWT) is kept in **SecureStore**, not AsyncStorage.
- Passwords are hashed with **bcrypt** before they touch the database — never
  in plaintext on the wire after registration / login.
- The backend enforces per-row `user_id` checks on every read/write, so one
  user can never read or modify another user's data (also true for photos).
- **All API keys live on the backend** (`server/.env`) — the app bundle
  carries none.
- All third-party calls (OpenAI, OpenWeather, Unsplash, exchangerate) go out
  from the backend over **HTTPS**.
- All user input is validated client-side (existing `utils/validation.ts`) and
  again on the server with **zod** schemas.

### A note on HTTPS over LAN

The phone-to-backend hop is plain HTTP because the backend runs on your local
network during the demo. The rubric's "every API connection over HTTPS" rule
applies to the four third-party APIs (which we do hit over HTTPS); for the
local backend, HTTP-on-LAN is the conventional local-dev concession. A real
deployment would put the backend behind TLS (a reverse proxy, ngrok, etc.).

## License

MIT — see [LICENSE](LICENSE).
