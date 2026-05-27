# Dara — Travel Journal & AI Companion 🌍

Dara is a mobile travel journal built with **React Native (Expo)**. You record
**trips** and the **entries** within them — each entry can carry a photo, your
GPS location (auto-resolved to a place name), the weather, and a note. An
**AI travel companion** chats with you and turns a trip's entries into a written
"trip story". Your journal lives in the cloud, so it survives a reinstall and
follows you across devices.

> Course project for *Mobile Programming — Laboratory*. Built against the full
> grading rubric (see [`docs/Project-Criteria.md`](docs/Project-Criteria.md)),
> targeting the top grade: all base criteria plus all four extended criteria.

## Screenshots

_Added in the final milestone (key screens + a short flow GIF)._

## Features

- 📓 **Trips → Entries** journal with photos, notes, dates, and locations
- 🔐 **Accounts** — email/password sign-up & login; each user sees only their own data
- ☁️ **Cloud sync** — data persists across reinstalls and devices (Firebase)
- 📷 **Camera & gallery** photos, 📍 **GPS** location tagging
- 🌤️ **Weather**, 🗺️ **reverse geocoding**, 🖼️ **destination imagery**, 💱 **currency** via public APIs
- 🤖 **AI companion** — chat + auto-generated trip stories (key kept server-side)
- 📴 **Offline-friendly** — previously loaded entries remain readable without a connection
- ✨ Animations, gestures (swipe-to-delete, pull-to-refresh), and haptics

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Expo (managed) + React Native, **TypeScript** |
| Navigation | **Expo Router** (file-based) — tabs + stack + modal |
| State | **Redux Toolkit** + typed hooks |
| Backend | **Firebase** — Auth, Firestore, Storage; Cloud Function AI proxy |
| Native | image-picker, location, secure-store, haptics, notifications |
| UX | Reanimated, Gesture Handler, NetInfo |
| Quality | ESLint + Prettier, Jest + React Native Testing Library |

### Why Redux Toolkit?

The app has several pieces of genuinely global state (auth/session, the user's
trips and entries, network status) read by many distant screens. Redux Toolkit
gives one predictable store with low boilerplate; Firebase listeners dispatch
into slices so the UI always reads from a single source of truth. Screen-local
state (form fields, open modals) stays in `useState`.

## Project structure

```
app/            # Expo Router routes (screens & layouts)
components/     # reusable presentational components
constants/      # theme.ts (design tokens), Colors.ts
store/          # Redux Toolkit store, slices, typed hooks
services/       # Firebase + external API clients, env config
hooks/          # custom hooks
types/          # shared domain models (Trip, Entry, ...)
utils/          # pure helpers (dates, validation, stats)
functions/      # Firebase Cloud Functions (AI proxy)
docs/           # project criteria
```

## Getting started

**Prerequisites:** Node 20+, npm, the [Expo Go](https://expo.dev/go) app (or an
Android/iOS emulator).

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    then fill in your Firebase + API keys (see .env.example)

# 3. Start the dev server
npm start
#    scan the QR code with Expo Go, or press a / i for an emulator
```

### Environment variables

All client config lives in `.env` (gitignored). Copy `.env.example` and fill in
Firebase credentials and the free-tier API keys. The **AI provider key is never
in the app** — it is configured on the Cloud Function and the app only calls the
function's URL.

## Scripts

```bash
npm start          # Expo dev server
npm run android    # open on Android
npm run ios        # open on iOS (macOS)
npm test           # run the Jest test suite
npm run lint       # ESLint
npm run format     # Prettier --write
```

## Testing

Unit and component tests with Jest + React Native Testing Library, run via
`npm test`. Coverage focuses on business logic (date/stats/validation helpers),
Redux slices, hooks, and key component behavior.

## Building (EAS)

A preview Android build is produced with EAS:

```bash
eas build --platform android --profile preview
```

_Full build steps and the download link are documented in the final milestone._

## License

MIT — see [LICENSE](LICENSE).
