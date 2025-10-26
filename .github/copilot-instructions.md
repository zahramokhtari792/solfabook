## solfabook — AI assistant quick instructions

This file is a concise reference for automated code agents (Copilot-style) to be productive in this repository.

1. Project type
   - React Native app built with Expo (see `package.json`). Target platforms: Android / iOS / Web.

2. Big-picture architecture
   - Entry point: `App.js` — sets up Providers (i18n, Redux `store`, Navigation, SafeArea, Gesture handler).
   - Redux store: `store.js` combines slices in `slices/` (notably `authSlice`, `userSlice`, `languageSlice`, `contactSlice`).
   - Screens live under `screens/` grouped by feature (e.g., `explore`, `library`, `albums`, `account`).
   - Reusable UI in `components/` and visual assets in `assets/` (fonts, locales, svg icons).
   - Network endpoints and static hosts: `services/URL.js` exports `uri`, `mainUri`, `imageUri`, `staticUri`, `dlUrl` — use these for API calls.

3. API and data flow patterns
   - Network calls use `axios` directly in screens and slices. Example: `slices/userSlice.js` uses `createAsyncThunk` and calls `${uri}/fetchUser`.
   - Authorization: token stored in Redux at `state.auth.token` and passed as `Authorization: Bearer <token>` in axios headers.
   - Many screens call endpoints via `axios.post(`${uri}/<endpoint>`...)` — keep requests consistent with this pattern.

4. Localization
   - i18n is configured in `App.js` using `react-i18next`. Resource files: `assets/locales/en.json` and `assets/locales/fa.json`.
   - Use `useTranslation()` in screens/components to get `t()` for translated strings.

5. Styling and themes
   - Shared styles and layout helpers live in `styles/NewStyles.js` and theme tokens in `theme/Color.js`.
   - Components accept theme colors sometimes via `themeColorX.bgColor(alpha)` pattern.

6. Conventions and patterns agents should follow
   - File and folder grouping is feature-based (e.g., `screens/explore/*`) — prefer making new files in the correct feature folder.
   - Network: prefer `axios` usage consistent with existing headers and error handling. See `helpers/Common.js` for `handleError` and `showToastOrAlert` helpers.
   - State: prefer adding thunks in `slices/` when asynchronous logic affects global state; local screen-only calls may remain in screens.
   - Token handling: read/write only through the `auth` slice actions (`setToken`, `removeToken`).
   - Fonts are loaded via `useFonts` in `App.js`. Add new fonts to `assets/fonts/` and register them there.

7. Build / run / debug
   - Primary dev commands (defined in `package.json`): `expo start`, `expo start --android`, `expo start --ios`, `expo start --web`.
   - This repo expects Expo SDK ~53 and React Native 0.79 — be cautious when upgrading packages.
   - Debugging: use Expo dev tools and standard React Native debugging. For deep native issues, see `expo-dev-client` usage in `package.json`.

8. Common helper utilities and examples
   - `helpers/Common.js` contains: `handleError`, `formatPrice`, `formatDateTime`, `showToastOrAlert` — use them for consistent UX and error messages.
   - Example API call pattern (from `slices/userSlice.js`):
     axios.get(`${uri}/fetchUser`, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } })

9. Files to inspect for context when working on features
   - `App.js` — app initialization and navigation stack
   - `store.js` and `slices/` — global state shape and thunks
   - `services/URL.js` — base API URLs
   - `helpers/Common.js` — error handling and utilities
   - `components/` and `assets/` — shared UI and icons

10. PR and code style guidance for agents
   - Make minimal, focused changes. Prefer adding new slice thunks rather than moving large logic across files.
   - Preserve existing patterns (axios usage, Redux Toolkit slices). Use `dispatch(fetchUser(token))` style for state refresh.
   - When adding network calls, reuse `handleError` to surface user-facing messages.

If any of these points are unclear or you want the instructions expanded (e.g., testing, CI, or specific contributor workflows), tell me which area to elaborate.
