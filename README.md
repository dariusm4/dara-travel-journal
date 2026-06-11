# Dara — Travel Journal & AI Companion 🌍

Dara is a mobile travel journal built with **React Native (Expo)**. You record
**trips** and the **entries** within them — each entry can carry a photo, your
GPS location (auto-resolved to a place name and weather), and a note. An
**AI travel companion** chats with you and turns a trip's entries into a written
"trip story". Your journal lives in the cloud, so it survives a reinstall and
follows you across devices.

> Course project for _Mobile Programming — Laboratory_. Built against the full
> grading rubric (see [`docs/Project-Criteria.md`](docs/Project-Criteria.md)):
> all 15 base criteria plus all four extended criteria (A–D).

## Screenshots

> _Add 3–4 screenshots and a short GIF here before submitting_ — e.g. the trips
> list, a trip with its AI story, the entry form with a photo, and the companion
> chat. Place images under `docs/screenshots/` and reference them here.

## Features

- 📓 **Trips → Entries** journal with photos, notes, dates, locations, weather
- 🔐 **Accounts** — email/password sign-up & login; each user sees only their own data
- ☁️ **Cloud-synced entries** — text data survives reinstall and travels across devices (Firebase)
- 📷 **Camera & gallery** photos kept on device · 📍 **GPS** with reverse geocoding
- 🌤️ **Weather** on entries, 🖼️ **Unsplash** cover suggestions, 💱 **currency converter**
- 🤖 **AI companion** — chat + auto-generated trip stories (OpenAI)
- 🔔 **Local reminders**, 📊 travel **stats** (trips / places / days)
- 📴 **Offline-friendly** — previously loaded data stays readable without a connection
- ✨ Animations, swipe-to-delete gestures, and haptics

## Tech stack

| Area       | Choice                                                                   |
| ---------- | ------------------------------------------------------------------------ |
| Framework  | Expo (managed) + React Native, **TypeScript**                            |
| Navigation | **Expo Router** (file-based) — tabs + stack + modal                      |
| State      | **Redux Toolkit** + typed hooks                                          |
| Backend    | **Firebase** — Auth + Firestore (free Spark plan; photos stay on device) |
| Native     | image-picker, location, secure-store, haptics, notifications             |
| UX         | Reanimated, Gesture Handler, NetInfo                                     |
| Quality    | ESLint + Prettier, Jest + React Native Testing Library                   |

### Why Redux Toolkit?

The app has several pieces of genuinely global state (auth/session, the user's
trips and entries, network status) read by many distant screens. Redux Toolkit
gives one predictable store with low boilerplate; Firebase listeners dispatch
into slices so the UI always reads from a single source of truth. Screen-local
state (form fields, open modals) stays in `useState`.

## Project structure

```
app/            # Expo Router routes (screens & layouts)
components/     # reusable presentational components (ui/, journal/)
constants/      # theme.ts (design tokens), Colors.ts
store/          # Redux Toolkit store, slices, typed hooks
services/       # Firebase + external API clients, env config
hooks/          # custom hooks (useTheme, useAuth, sync hooks, ...)
types/          # shared domain models (Trip, Entry, ...)
utils/          # pure helpers (dates, validation, currency, stats)
docs/           # project criteria
```

## Getting started

**Prerequisites:** Node 20+, npm, the [Expo Go](https://expo.dev/go) app (or an
Android/iOS emulator). You'll need a free **Firebase** project (Spark plan is
fine — no card on file) and an **OpenAI** API key for the AI companion.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env   # then fill in the values from the steps below

# 3. Start the dev server
npm start              # scan the QR with Expo Go, or press a / i for an emulator
```

### 1) Firebase — Auth + Firestore (criteria A & B)

1. Create a project at the [Firebase console](https://console.firebase.google.com/).
2. **Authentication → Sign-in method**: enable **Email/Password**.
3. **Firestore Database**: create a database (production mode).
4. **Project settings → Your apps → Web app**: copy the SDK config into `.env`
   (`EXPO_PUBLIC_FIREBASE_*`).
5. Deploy the Firestore security rules (per-user isolation):
   ```bash
   npm i -g firebase-tools   # if needed
   firebase login
   firebase use --add        # select your project
   firebase deploy --only firestore:rules
   ```

> Photos are stored on the device in `FileSystem.documentDirectory` — no
> Firebase Storage, no Cloud Functions, no upgrade to the Blaze plan.

### 2) API keys for `.env` (criteria C + 14)

Add the keys to `.env`. The rubric (criteria C + 14) explicitly accepts API
keys in `.env` via Expo's `EXPO_PUBLIC_*` convention — no backend deploy needed.

- `EXPO_PUBLIC_OPENAI_API_KEY` — [platform.openai.com](https://platform.openai.com/) (powers the AI companion)
- `EXPO_PUBLIC_OPENWEATHER_API_KEY` — [openweathermap.org](https://openweathermap.org/api)
- `EXPO_PUBLIC_UNSPLASH_ACCESS_KEY` — [unsplash.com/developers](https://unsplash.com/developers)
- `EXPO_PUBLIC_EXCHANGERATE_API_KEY` — [exchangerate-api.com](https://www.exchangerate-api.com/) _(optional; a keyless fallback is used if blank)_

## Scripts

```bash
npm start          # Expo dev server
npm run android    # open on Android
npm run ios        # open on iOS (macOS)
npm test           # run the Jest test suite (44 tests)
npm run lint       # ESLint
npm run format     # Prettier --write
```

## Testing

Jest + React Native Testing Library (`npm test`). Coverage spans pure logic
(date / validation / currency / stats helpers), Redux slices, store wiring, and
component behavior (Button, EmptyState).

## Building a preview APK (criterion 15)

The app builds with **EAS Build** (profiles in `eas.json`):

```bash
npm i -g eas-cli
eas login
eas build:configure          # one-time
eas build --platform android --profile preview
```

This produces an installable `.apk`. Before submitting, replace the placeholder
app icon and splash image in `assets/images/` (a 1024×1024 source works with
Expo's generator) so the app no longer uses the default Expo artwork.

## Security notes (criterion 14)

- Auth session token is kept in **SecureStore**, not AsyncStorage.
- All API keys live in `.env` (gitignored) and are loaded via `EXPO_PUBLIC_*`,
  the convention the rubric explicitly accepts (criteria C + 14).
- All inputs are validated; all API calls use HTTPS.

## License

MIT — see [LICENSE](LICENSE).
