# Project Evaluation Criteria — React Native (Expo)
## Mobile Programming Languages — Laboratory

---

# GRADING STRUCTURE

| Grade | Requirements |
|-------|-------------|
| **3 (pass)** | Base criteria 1–8 met at a basic level |
| **3.5** | Base criteria 1–8 well executed + partially 9–15 |
| **4 (good)** | All base criteria (1–15) met |
| **4.5** | Base criteria + 1 extended criterion (A–D) |
| **5 (very good)** | Base criteria + minimum 2 extended criteria (A–D) |
| **6** | Base criteria + 3–4 extended criteria, high code quality, "wow factor" |

**Prerequisites (project will not be graded without these):**
- Code hosted in a Git repository (GitHub/GitLab) with a meaningful commit history
- README with setup instructions
- Project runs without errors in Expo Go or via EAS Build

---

# BASE CRITERIA (up to grade 4.0)

---

## 1. Application Architecture

Your app should follow a recommended architectural pattern for React Native — such as Context API, Redux Toolkit, or the presentational/container component pattern — to keep code readable, testable, and maintainable.

You should be able to explain **why** you chose a particular pattern and how it's implemented in your project.

**Useful resources:**
- Redux Toolkit (recommended): https://redux-toolkit.js.org/
- Context API: https://react.dev/reference/react/createContext
- Passing Data Deeply with Context: https://react.dev/learn/passing-data-deeply-with-context

### What does this mean in practice?

Architecture sounds intimidating, but it's really just about how you organize your code. You can write an app that works with everything in a single 2000-line file — but good luck changing anything a month later.

Think of it like building a house. You could build one without an architect's blueprint — it'll probably stand. But when you want to add a second floor, you'll find the foundation is too weak and the pipes go in the wrong direction. Same with code.

In React Native, you have a few approaches:

**Context API** — built into React, no extra installs needed. Great for smaller apps. You create a "context" which acts like a global data box — any component can read from it. Downsides? With many contexts things get messy, and every context change re-renders everything that listens to it.

**Redux Toolkit** — the more "grown-up" solution. You have one central store, everything is predictable, easy to debug. Classic Redux used to require tons of boilerplate — Redux Toolkit has improved this dramatically. Recommended for larger apps.

**Component pattern** — splitting into "dumb" presentational components (how things look) and "smart" container components (where data comes from). This doesn't exclude Redux or Context — they combine.

For your project — if the app is simple (a few screens, little global state) — Context is enough. If you're building something ambitious — go with Redux Toolkit. The most important thing: don't keep everything in one file. Separate folders for components, screens, hooks, services. If I open your project and can see what's where in 10 seconds — that's good architecture.

---

## 2. Handling Different Screen Sizes and Orientations

Your app should be responsive and display correctly on devices with different screen sizes. Use Flexbox and relative units instead of hardcoded pixel values for layout containers.

**Useful resources:**
- Flexbox: https://reactnative.dev/docs/flexbox
- Dimensions API: https://reactnative.dev/docs/dimensions
- useWindowDimensions: https://reactnative.dev/docs/usewindowdimensions
- Height and Width: https://reactnative.dev/docs/height-and-width

### What does this mean in practice?

One of the biggest challenges in mobile development is that people have a million different phones. Some have an iPhone SE with a small screen, others have a Samsung Ultra with a screen the size of a pizza tray. Your app needs to look good on both.

In web development you have media queries — here the equivalent is **Flexbox**. Good news: Flexbox in React Native works almost identically to CSS, with one key difference — the default `flexDirection` is `column`, not `row`. Elements stack top to bottom, which makes sense on a phone.

Golden rule number one: **never use hardcoded pixels for container widths**. You can give `width: 300` to a button — that's fine. But `width: 390` on a main container — that's a disaster, because you're assuming a specific screen width.

Instead, use:
- `flex: 1` — "take up all available space"
- Percentages — `width: '90%'` — works on every screen
- `useWindowDimensions()` — a hook that gives you the current screen width and height. Useful when you want e.g. a square element: `width: width * 0.9, height: width * 0.9`

Regarding orientation — by default Expo apps run in portrait. If you want landscape support, set it in `app.json` and `useWindowDimensions` will automatically return new values after rotation. But honestly? For your project, portrait-only is totally fine.

What I'll check: whether the app looks OK on a small screen (iPhone SE / small Android) and on a large screen. I'll run it on two emulators. If text overflows or buttons overlap — that's a problem.

---

## 3. Code Quality

Code should be readable, well-organized, and follow React and TypeScript/JavaScript conventions. Use ESLint and Prettier from day one of your project.

**Useful resources:**
- ESLint: https://eslint.org/
- Prettier: https://prettier.io/
- Airbnb React Conventions: https://github.com/airbnb/javascript/tree/master/react

### What does this mean in practice?

Imagine you start a new job and inherit a project from a colleague who left. You open the code and see: variables named `x`, `temp`, `data2`, `handleClick2Final_v3`. Functions are 200 lines long. No comments. One file has 3000 lines. How do you feel? Exactly.

Build good habits from the start:

**Naming** — components in PascalCase (`TravelCard`, `AddEntryScreen`), functions and variables in camelCase (`handleSave`, `isLoading`), constants in UPPER_SNAKE_CASE (`MAX_PHOTOS`, `API_URL`). Names should say WHAT it does, not HOW. `getUserLocation()` — good. `doStuff()` — no.

**File structure** — something like this works well:
```
src/
  components/    — reusable components
  screens/       — screens (views)
  hooks/         — custom hooks
  services/      — API logic, storage
  constants/     — constants, types
  assets/        — images, fonts
```

**ESLint and Prettier** — install them from day zero. ESLint catches logical errors (unused variables, missing useEffect dependencies), Prettier auto-formats code. Expo gives you a basic ESLint config when creating a project — just extend it.

What I look for:
- Can I open a file and know what it does in 5 seconds?
- Are components small (under 100–150 lines)?
- Is there no copy-pasted code in three places (DRY principle)?
- Is ESLint not screaming red in 50 places?

I don't require perfection — I require effort. I can tell the difference between someone who tries to write clean code and someone who doesn't care. Minor inconsistencies — fine. Total chaos — not fine.

---

## 4. Tests

Your project should include **minimum 8–10 meaningful tests** covering key business logic, hooks, and components.

**Useful resources:**
- Jest: https://jestjs.io/
- React Native Testing Library: https://callstack.github.io/react-native-testing-library/
- Common Testing Mistakes: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

### What does this mean in practice?

I know, testing isn't anyone's favorite topic. "The app works, why test?" — I hear this every semester. The answer is simple: the app works NOW. But tomorrow you'll add a new feature and suddenly something that worked stops working. And you have no idea what or why. Tests are your safety net.

I'm not asking for 90% code coverage — that would be unrealistic. I'm asking for **minimum 8–10 meaningful tests**. Meaningful — that's the key word.

**Good tests:**
- "Function `formatDate` returns date in the correct format" — you're testing logic
- "After pressing Save button, onSave is called with correct data" — you're testing behavior
- "If the entries list is empty, 'No entries' message is displayed" — you're testing an edge case
- "Hook useEntries returns an empty array on start" — you're testing a hook

**Weak tests (avoid these):**
- "Button component renders" — great, but so what?
- A test that tests React's internals instead of your code

Tools: Jest (test framework) comes by default with Expo projects. For component testing, use React Native Testing Library — it lets you test components the way a user interacts with them: "find the button with text Save and click it."

Organization: keep tests next to the file they test: `formatDate.ts` → `formatDate.test.ts`. Or in a `__tests__/` folder. Both are fine.

---

## 5. Code and Project Documentation

Your README should be the business card of your project. Think about it — a year from now you're looking for a job and send your GitHub link to a recruiter. They open the repo and see... an empty README with one sentence "my project." What impression does that make?

**Useful resources:**
- Markdown Guide: https://www.markdownguide.org/
- GitHub README Best Practices: https://github.com/othneildrew/Best-README-Template

### What should be in your README — minimum:

**Title and short description** — what the app is, what it does, 2–3 sentences.

**Screenshots or GIFs** — seriously, this makes a HUGE difference. Nobody wants to launch an unknown app just to see what it looks like. Take 3–4 screenshots of key screens. Bonus: a short GIF showing the main flow.

**Setup instructions** — step by step. What commands to run, what to install. Test it like this: imagine a classmate clones your repo — will they have it running in 5 minutes? If not — fix the instructions.

**Tech stack list** — React Native, Expo, TypeScript, plus libraries you use.

**Project structure** — optional, but nice to have a folder tree with descriptions.

As for code comments — don't comment obvious things. `// increment counter by 1` above `counter++` is useless. Comment the WHY, not the WHAT. "Why is there a 500ms setTimeout here? Because the navigation animation takes 300ms and we need to wait" — that's a valuable comment.

---

## 6. Integration with Native Device Features

Your app should use at least **two native device features** — e.g., camera, photo gallery, geolocation, local notifications, haptics, accelerometer, on-device storage.

You should be able to describe which native features you used, why, and how they're implemented.

**Useful resources:**
- Expo Camera: https://docs.expo.dev/versions/latest/sdk/camera/
- Expo Image Picker: https://docs.expo.dev/versions/latest/sdk/imagepicker/
- Expo Location: https://docs.expo.dev/versions/latest/sdk/location/
- Expo Notifications (local): https://docs.expo.dev/versions/latest/sdk/notifications/
- Expo SecureStore: https://docs.expo.dev/versions/latest/sdk/securestore/
- Expo Haptics: https://docs.expo.dev/versions/latest/sdk/haptics/

### What does this mean in practice?

This is where it gets fun! Why write a mobile app if it doesn't use what the phone has to offer? You can't do this in a regular website.

The most popular and easiest options with Expo:

**Camera / Photo Gallery** — `expo-image-picker` gives you one API for both taking photos with the camera and choosing from the gallery. Literally a few lines of code.

**Geolocation** — `expo-location` lets you get the current GPS position. Show it on a map, save coordinates with an entry, calculate distance. Remember: you must handle the case when the user doesn't grant permissions! You can't assume they'll always say "yes."

**Local Notifications** — `expo-notifications` lets you schedule notifications without a server. E.g., "Hey, you haven't added an entry in 3 days!"

**On-device storage** — `AsyncStorage` for regular data, `expo-secure-store` for sensitive data (tokens, passwords). This also counts as a native feature because it uses the device's native storage system.

Important: **handle permissions properly**. Camera and location require user consent. Your code must:
1. Request permission
2. Handle denial (don't crash — show a sensible message)
3. Handle the "undetermined" state

This is what separates a student app from a professional one — how you handle edge cases.

---

## 7. Handling Asynchronous Operations

Your app should properly manage async operations — API calls, storage access, location fetching — using async/await with proper loading states, error handling, and user feedback.

**Useful resources:**
- Promises and async/await: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
- TanStack Query (React Query): https://tanstack.com/query/latest
- Redux Toolkit Async Thunks: https://redux-toolkit.js.org/api/createAsyncThunk

### What does this mean in practice?

In a mobile app, tons of things happen "not instantly." Fetching data from an API — takes time. Saving to a database — takes time. Taking a photo — takes time. And meanwhile the user is staring at the screen wondering "did this app freeze?"

That's why every async operation must have three states:
- **Loading** — something is happening, show a spinner or skeleton
- **Success** — it worked, show the data
- **Error** — something went wrong, show a message, give a retry option

One key thing to remember: **you can't make useEffect async directly**. This is a common mistake:

```typescript
// ❌ WRONG
useEffect(async () => { ... }, []);

// ✅ CORRECT
useEffect(() => {
  const fetchData = async () => { ... };
  fetchData();
}, []);
```

For more advanced use — check out **TanStack Query** (formerly React Query). It's a library that automatically manages caching, refetching, and loading/error states for you. Writing all of this manually every time is tedious and error-prone. TanStack Query does it elegantly.

What I'll look at in your projects: is there ANY loading indicator when data is loading? Is there error handling when a fetch fails? An app that shows a blank screen for 3 seconds and then suddenly — bam — data = bad UX. An app that shows a nice spinner, then data = good UX. An app that shows "Oops, check your connection" when offline instead of crashing = even better.

---

## 8. Screen Navigation

Your app should implement intuitive navigation using **Expo Router** (recommended) or React Navigation. Navigation should support passing parameters between screens.

Minimum requirement: **two navigation types** (e.g., stack + tabs, stack + drawer, tabs + modal).

**Useful resources:**
- Expo Router: https://docs.expo.dev/router/introduction/
- Expo Router — Tabs: https://docs.expo.dev/router/advanced/tabs/
- React Navigation (alternative): https://reactnavigation.org/

### What does this mean in practice?

Navigation is the backbone of every mobile app. Without it, you have one screen and that's it.

I recommend **Expo Router**. Why? It works on a file-based routing principle — if you know Next.js or Nuxt, same idea. You create a file in the `app/` folder and it automatically becomes a screen. `app/index.tsx` = home screen. `app/details/[id].tsx` = details screen with a dynamic parameter. Zero configuration.

The navigation types you should know:

**Stack** — screens stacked on top of each other, like a deck of cards. You go to details — a new screen "slides" on top. You go back — it pops off. This is the default navigation.

**Tabs** — tabs at the bottom of the screen. Instagram has: Home, Search, Reels, Shop, Profile. Each tab has its own stack. In Expo Router, you create a `(tabs)/` folder and files inside become tabs.

**Drawer** — a side menu that slides out. Less popular in modern apps, but useful.

**Modal** — a screen that pops up "on top." E.g., for filtering, creating a new entry.

For your project I require at least **two types**. The most common combo is tabs + stack, because almost every real-world app has this.

Passing parameters — in Expo Router it works like this:
```typescript
// Navigate
router.push(`/details/${entry.id}`);

// Receive in details/[id].tsx
const { id } = useLocalSearchParams();
```

Clean and simple. What I'll check: is the navigation intuitive (do I have to search for how to get back to the list?), do parameters pass correctly, and does the back button work as expected?

---

## 9. App Performance

Your app should be optimized for performance — minimize unnecessary re-renders, manage memory efficiently, and optimize long lists.

**Useful resources:**
- React DevTools: https://reactnative.dev/docs/debugging
- Expo DevTools: https://docs.expo.dev/debugging/tools/
- Optimizing FlatList: https://reactnative.dev/docs/optimizing-flatlist-configuration
- React.memo, useMemo, useCallback: https://react.dev/reference/react

### What does this mean in practice?

Performance is a topic that's easy to ignore because "it runs fast on my emulator." But emulators usually have more resources than a real, older user phone. And suddenly your app on a real 2020 Samsung lags like crazy.

I'm not asking for perfect optimization — but I'm asking for awareness. The basics:

**FlatList instead of ScrollView for long lists.** If you have 10 elements — ScrollView is fine. If 100+ — you must use FlatList, because it only renders visible elements. Without it, the phone tries to render everything at once and the app stutters.

**FlatList configuration** — a few props that make a big difference:
- `keyExtractor` — avoid using array indices as keys, use real IDs
- `getItemLayout` — if items have fixed height, tell FlatList about it
- `initialNumToRender` — how many items to render on start (default 10, can lower it)
- `removeClippedSubviews` — can help on Android

**React.memo** — wraps a component and says "don't re-render me if my props haven't changed." Useful for list items.

**useMemo and useCallback** — useMemo memoizes a computed value, useCallback memoizes a function. Don't apply them everywhere blindly — apply them where there's an actual performance issue.

How to check if you have a problem? In React DevTools you can turn on "Highlight updates when components render" — it shows a colored border around everything that re-renders. If you scroll a list and the entire screen flashes orange — you have a problem.

I won't penalize you for missing `useMemo` on every line. But if your lists with 50+ items visibly lag — that's a minus.

---

## 10. Style and UI/UX

Your app should have a consistent, clean user interface. It doesn't need to be App Store-beautiful, but it needs to be **consistent** and pleasant to use.

You can use a UI component library (React Native Paper, NativeWind, Tamagui) or custom styles — both are fine.

**Useful resources:**
- React Native Paper: https://callstack.github.io/react-native-paper/
- NativeWind (Tailwind for RN): https://www.nativewind.dev/
- Tamagui: https://tamagui.dev/

### What does this mean in practice?

Let's start with the difference between **UI** and **UX**: UI is how the app LOOKS (colors, fonts, spacing). UX is how the app WORKS from the user's perspective (do I know what to tap, is the form logical, can I go back).

Minimum requirements:

**Consistency** — this is the most important thing. If buttons on one screen are blue and rounded, they should be blue and rounded on every screen. If headings are size 24, they're size 24 everywhere. Create a `theme.ts` file with colors, fonts, and spacing, and use it everywhere.

**Readability** — text must be legible (don't put gray text on a light gray background with font size 10). Buttons must look like buttons. Tappable elements should have feedback (color change on press — use `Pressable` with `style` as a function).

**Spacing** — don't glue elements together. Margins and padding. One of the most common mistakes: text sticking to the edge of the screen. Add `padding: 16` to a container and it instantly looks better.

A component library (e.g., React Native Paper) gives you ready-made components: buttons, cards, dialogs, app bars. They look professional out of the box. Recommended if design isn't your strong suit.

Custom styles — if you feel confident, you can style everything yourself with `StyleSheet.create()`. I respect that, but then watch your consistency carefully.

What to avoid: the default React Native look (gray text on white background, zero padding). That looks like a prototype, not an application.

---

## 11. Application State Management

Your app should effectively manage global state using Context API, Redux Toolkit, or Zustand. You should be able to justify your choice.

**Useful resources:**
- Redux Toolkit: https://redux-toolkit.js.org/
- Context API: https://react.dev/learn/passing-data-deeply-with-context
- Zustand: https://zustand-demo.pmnd.rs/

### What does this mean in practice?

Application state is the heart of your app — the data that lives "in memory" while the app is running and changes in response to user actions.

Let's distinguish two types:

**Local state** — data needed by only one component. E.g., "is the modal open," "what did the user type in the TextInput," "is the spinner spinning." For this: `useState`. Simple. Don't overcomplicate it.

**Global state** — data needed in many places across the app. E.g., list of journal entries, logged-in user data, app settings. Here you need something more than `useState`.

Your options:

**Context API** — built into React. Create a context, Provider at the top of the component tree, and `useContext()` wherever you need data. Pros: zero extra libraries. Cons: with many contexts it gets messy, and every context change re-renders EVERYTHING subscribed to it.

**Redux Toolkit** — more complex but more scalable. One store, slices (chunks of state), and you dispatch actions. Sounds complicated? It is a bit, but Redux Toolkit has simplified it enormously. Recommended for larger projects.

**Zustand** — my quiet recommendation for medium-sized projects. Very simple API, minimal boilerplate, works great. `const useStore = create((set) => ({ ... }))` and you're done. If you don't want to wrestle with Redux but Context isn't enough — Zustand is the sweet spot.

A mistake I see every semester: **putting EVERYTHING in global state**. Whether a modal is open? That's local state for one screen — don't put it in Redux. Rule of thumb: if data is needed by only one component → `useState`. If by two nearby components → lift state to the parent. If by many distant components → global state.

---

## 12. Error Handling

Your app should handle errors gracefully — network issues, unexpected API responses, runtime errors — in a user-friendly way.

**Useful resources:**
- Error Boundaries: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- NetInfo: https://github.com/react-native-netinfo/react-native-netinfo

### What does this mean in practice?

In the mobile world, things WILL break. The internet will drop. The API will return a 500. The user will type an emoji where you expect a number. GPS won't get a signal inside a building. And your app can't just "give up" — it must handle these situations gracefully.

Three levels of error handling:

**Level 1: Try-catch on async operations** — this is the absolute minimum. Every `fetch`, every storage read, every async operation should be in a try-catch. And in the catch — show the user a human-readable message. Not: "Error: Network request failed." Yes: "Couldn't load data. Check your internet connection and try again."

**Level 2: Error Boundary** — a React component that catches rendering errors. Without it, one crashing component takes down the entire app. With an Error Boundary, the crashing component shows a fallback ("Something went wrong"), while the rest of the app keeps working. Write it once and wrap your main sections with it.

**Level 3: Connectivity check** — `@react-native-community/netinfo` tells you whether the user has internet. If they don't — don't try to fetch data from the API. Show a "No connection" message immediately and display cached data (if you have any).

A pattern I recommend:
```typescript
try {
  setLoading(true);
  const data = await fetchEntries();
  setEntries(data);
} catch (error) {
  setError('Failed to load entries');
  // Optionally: log the error to console
} finally {
  setLoading(false);
}
```

This `try/catch/finally` pattern with `loading`, `error`, `data` states — memorize it. You'll use it all the time.

---

## 13. Offline Mode (Basic)

Your app should offer basic functionality without internet access — e.g., browsing previously loaded data from local cache.

Data loaded online should remain accessible after losing connection. Full offline-to-online synchronization is an extended criterion (see criterion D).

**Useful resources:**
- AsyncStorage: https://react-native-async-storage.github.io/async-storage/
- NetInfo: https://github.com/react-native-netinfo/react-native-netinfo

### What does this mean in practice?

Can your app survive without internet? In airplane mode? In the subway where signal is spotty?

At the base level (for a grade of 4) I require something simple: **data that was loaded once should be available without internet**. How to achieve this?

The simplest "cache-first" pattern:
1. User opens app with internet → fetch data from API → save to AsyncStorage → display
2. User opens app WITHOUT internet → check AsyncStorage → data is there → display it
3. User opens app with internet after being offline → fetch fresh data → overwrite cache

This is not complicated. Literally a few lines with each fetch:
```typescript
// When fetching data
const data = await fetchFromAPI();
await AsyncStorage.setItem('entries', JSON.stringify(data));

// When the app starts
const cached = await AsyncStorage.getItem('entries');
if (cached) setEntries(JSON.parse(cached));
```

What I do NOT require for a grade of 4: synchronizing data created offline with the server after connection is restored. That's an advanced topic and it's in the extended criteria (criterion D). For a 4, it's enough that your app doesn't show a blank screen when there's no internet.

---

## 14. Security

Your app should follow basic security practices — secure storage of sensitive data, input validation, and secure API communication.

You should be able to describe the security measures you applied.

**Useful resources:**
- React Native Security: https://reactnative.dev/docs/security
- Expo SecureStore: https://docs.expo.dev/versions/latest/sdk/securestore/
- OWASP Mobile Top 10: https://owasp.org/www-project-mobile-top-10/

### What does this mean in practice?

Three things I'll pay attention to:

**First: sensitive data storage.** API tokens, passwords, keys — these NEVER go into AsyncStorage. AsyncStorage is like an unsecured notepad — on Android, anyone with root access can read it. For sensitive data you have `expo-secure-store`, which under the hood uses Keychain (iOS) and Keystore (Android). Encrypted. Secure.

And one more thing: **API keys don't go into the code!** I see this every semester — someone pushes a file to GitHub with `const API_KEY = "abc123..."`. That's public. Bots scan GitHub looking for exposed keys. Use environment variables — in Expo you have `expo-constants` and `.env` files. And add `.env` to `.gitignore`!

**Second: input validation.** Never trust what the user types. If a field should be an email — validate the format with a regex. If it should be a number — check. If it should have max 500 characters — enforce it. This protects against crashes and potential attacks if data goes to a backend.

**Third: HTTPS.** Every API connection should be over HTTPS. No HTTP. In 2026 this is standard, but make sure your endpoints aren't on HTTP.

I don't require penetration testing — I require common sense. Is sensitive data in SecureStore? Are keys not in the code? Are inputs validated? Three simple checkboxes.

---

## 15. Deployment and Building

You should be able to build a production (or preview) version of your app using **EAS Build** and document the process in your README.

**Useful resources:**
- EAS Build: https://docs.expo.dev/build/introduction/
- EAS Build Setup: https://docs.expo.dev/build/setup/
- App Config (app.json): https://docs.expo.dev/versions/latest/config/app/
- Icons and Splash Screen: https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/

### What does this mean in practice?

Deployment — the moment of truth. Is your app more than just code on a laptop?

In our Expo ecosystem you have **EAS Build** — Expo Application Services. It's a cloud build system that takes your code and produces a ready .apk (Android) or .ipa (iOS) file. Best part — you don't need a Mac to build for iOS (though you do need one to test on a physical iPhone).

Minimum requirements:

**Configured `app.json`** — app name, identifier (bundle ID), version, icon, splash screen. This is the "business card" of your app in the system. The icon doesn't have to be a masterpiece — but don't leave the default Expo icon.

**A working build** — I want you to run `eas build --platform android --profile preview` at least once and get a working .apk. I don't require Google Play publication — but I require that the build succeeds and the app runs on it.

EAS configuration is simple:
```bash
# One-time setup
npx eas-cli init
eas build:configure

# Build
eas build --platform android --profile preview
```

In `eas.json` you have profiles: development (for testing), preview (for showing — generates .apk), production (for the store). For your project: preview is enough.

As for the icon and splash screen — Expo has a generator where you give it a 1024×1024 image and it does the rest. Don't be lazy — change the default icon. It takes 5 minutes and makes an enormous difference in how the project is perceived.

---

# EXTENDED CRITERIA (for grades 5.0 – 6.0)

To get a grade higher than 4.0, your project must meet ALL base criteria (1–15) and additionally implement extended criteria as described below.

| Grade | Requirement |
|-------|------------|
| **4.5** | Base criteria + 1 extended criterion |
| **5.0** | Base criteria + 2 extended criteria |
| **6.0** | Base criteria + 3–4 extended criteria + high quality |

---

## A. Backend and Database

Your app communicates with an external backend and stores data in a cloud database instead of (or in addition to) local storage. Recommended solutions: **Firebase (Firestore)**, **Supabase**, or a custom API (e.g., Express + MongoDB/PostgreSQL).

Data should be persistent — after uninstalling and reinstalling the app, data is still available after logging in.

**Useful resources:**
- Firebase + React Native: https://rnfirebase.io/
- Supabase + Expo: https://docs.expo.dev/guides/using-supabase/
- Firebase Firestore: https://firebase.google.com/docs/firestore

### What does this mean in practice?

Up until now, your app stored data on the device — AsyncStorage, SecureStore. That works, but it has a fundamental limitation: data lives on only ONE phone. Change your phone — data's gone. Uninstall the app — data's gone. Two devices — two different states.

A backend solves this. And you don't have to build one from scratch — in 2026 you have BaaS (Backend as a Service) options that give you a database, authentication, and API in minutes.

The two most popular options:

**Firebase (Google)** — the most popular BaaS in mobile. Firestore is a NoSQL database that syncs data in real-time. You also get Auth, file Storage, and Cloud Functions. Integration with React Native via `@react-native-firebase/app`. The free plan (Spark) is more than enough for a student project.

**Supabase** — "open-source Firebase." Based on PostgreSQL (SQL!), which might be more familiar. Also has Auth, Storage, and real-time subscriptions. Expo has an official integration guide for Supabase.

Which one to pick? Both are great. Firebase is more mature with more tutorials. Supabase is newer, but if you prefer SQL over NoSQL — go with Supabase.

What I expect:
- App data (entries, posts, whatever) saves to a cloud database
- After uninstalling and reinstalling the app and logging back in — data comes back
- CRUD operations (Create, Read, Update, Delete) work correctly
- Loading states and error handling for backend communication (you already know this from criterion 7)

This isn't easy — but it's exactly what's done in commercial apps. And that's why this criterion is for a 5, not a 4.

---

## B. Authentication and Authorization

Your app has a user registration and login system. Each user sees only their own data. User sessions are managed (auto-login, logout, token expiration handling).

Minimum: email + password authentication.
Bonus for a higher grade: two login methods (e.g., email + Google, email + Apple).

**Useful resources:**
- Firebase Auth: https://rnfirebase.io/auth/usage
- Supabase Auth: https://supabase.com/docs/guides/auth
- Expo AuthSession: https://docs.expo.dev/versions/latest/sdk/auth-session/
- Expo Apple Authentication: https://docs.expo.dev/versions/latest/sdk/apple-authentication/

### What does this mean in practice?

First, let's distinguish two terms that students often confuse:
- **Authentication** — "Are you who you say you are?" — the login process, confirming identity
- **Authorization** — "Are you allowed to do this?" — what permissions you have

Minimum requirements:

**Registration** — user creates an account (email + password at minimum). Validation: email must be an email, password must have at least 6 characters (Firebase requires 6).

**Login** — user logs in and gets a session. Token is saved (in SecureStore, NOT AsyncStorage!) and automatically verified on the next app launch (auto-login).

**Logout** — user can log out. Token is deleted. Simple thing, but students forget it.

**Screen protection** — a non-logged-in user sees the login/registration screen. A logged-in user sees the app. There's no way to "bypass" the login. In Expo Router you do this elegantly — in the layout you check auth state and redirect.

Important: never store passwords in plaintext ANYWHERE in your app. Firebase/Supabase handle password management for you — NEVER keep the password in component state, AsyncStorage, or anywhere on the client after sending it to the auth provider.

---

## C. External API Integration

Your app uses at least one external public API that meaningfully enhances functionality — e.g., weather, translations, maps (directions/geocoding), currencies, news, AI (ChatGPT API).

The data from the API should be a sensible, integral part of the app's flow — not a feature tacked on just to tick a box.

**Useful resources:**
- OpenWeatherMap: https://openweathermap.org/api
- Google Maps Directions: https://developers.google.com/maps/documentation/directions
- REST Countries: https://restcountries.com/
- DeepL API (translations): https://www.deepl.com/docs-api
- Unsplash API (photos): https://unsplash.com/developers
- ExchangeRate API: https://exchangerate-api.com/

### What does this mean in practice?

This is the moment when your app stops living in a bubble and starts using real-world data.

It's not about throwing in any random API just to pass. It's about the integration being **meaningful** in the context of your application. Examples:

**Travel app?** → Weather API (what's the weather like where I'm going?), exchange rate API (how much is coffee in yen?), geocoding API (converting addresses to coordinates), photo API (Unsplash — beautiful destination photos).

**Fitness app?** → Food info API (calories), weather API (can I run outside?).

**Educational app?** → Translation API (DeepL), quiz API, ChatGPT API for generating questions.

What I expect technically:
- Correct fetch/axios requests to an external API
- Loading, success, and error state handling
- Rate limit handling and API error handling (what if the API returns 429 Too Many Requests?)
- API key NOT hardcoded in the code (environment variables!)
- API data presented to the user in a meaningful way

What I will NOT accept: "I call randomfacts.com and display a random fact on the splash screen." That's not integration — that's a checkbox. I want the API data to be part of your app's core flow.

Tip: many public APIs require registration and offer a free tier with a request limit (e.g., 1000/day). That's plenty for a student project. Don't use APIs that cost money — there are plenty of free options.

---

## D. Advanced UX: Animations, Gestures, Offline Sync

Your app goes beyond basic UX and implements at least **two** of the following:

- **Animations** — transition animations, element appearance animations, loading animations (Reanimated, Lottie)
- **Gestures** — swipe-to-delete, drag & drop, pinch-to-zoom, long press with context menu (Gesture Handler)
- **Offline sync** — data created offline is automatically synchronized with the backend when connectivity is restored
- **Haptic feedback** — subtle vibrations on key actions (save, delete, toggle)

**Useful resources:**
- React Native Reanimated: https://docs.swmansion.com/react-native-reanimated/
- React Native Gesture Handler: https://docs.swmansion.com/react-native-gesture-handler/
- Expo Haptics: https://docs.expo.dev/versions/latest/sdk/haptics/
- Lottie for React Native: https://github.com/lottie-react-native/lottie-react-native

### What does this mean in practice?

This is where your app starts to FEEL like a real application, not a student project.

Open Instagram or Twitter. Notice: cards appear smoothly, swiping right on stories, pull-to-refresh with animation, the phone vibrates subtly when you like something. These aren't "bells and whistles" — this is UX that makes an app pleasant to use.

I require at least **two** elements from this list:

**Animations** — React Native Reanimated (v3) is the king of animations in RN. You can animate: elements appearing (fade in), screen transitions, expanding/collapsing sections, animated progress indicators. Or use Lottie — it lets you play ready-made animations (from lottiefiles.com) — e.g., an animated checkbox, loading animation, success checkmark.

**Gestures** — React Native Gesture Handler. Swiping on a list item to delete (like in the mail app). Pull-to-refresh (built into FlatList, but you can enhance it). Long press with a context menu. Pinch-to-zoom on photos. These are interactions people EXPECT in a mobile app.

**Offline sync** — this extends criterion 13. Now you're not just displaying cached data — the user creates a new entry offline → the entry saves locally → when internet returns → the entry automatically syncs with the backend. This is hard because you need to manage an operation queue and resolve conflicts. But it's a real-world problem.

**Haptic feedback** — `expo-haptics` gives you three vibration types: light, medium, heavy. Add a subtle vibration on important actions: deleting an entry, successful save, toggling a switch. Small detail, big impact.

Remember: the goal is not to stuff your app with animations. The goal is for animations and gestures to be PURPOSEFUL — to help the user, not distract them. A loading animation? Yes. An animation where every element bounces, rotates, and flashes? No.

---

# SUBMISSION CHECKLIST

Before submitting your project, make sure:
- [ ] README is complete (description, screenshots, setup instructions, tech stack)
- [ ] Code compiles and runs without errors in Expo Go
- [ ] Commit history is meaningful (not a single "everything" commit)
- [ ] You can answer questions about your code during the presentation

Good luck! 🚀