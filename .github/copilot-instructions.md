# solfabook — AI Agent Instructions

Concise reference for AI coding agents working in this React Native Expo codebase.

## 1. Project Overview
- **Stack**: React Native 0.79 + Expo SDK ~53, targets Android/iOS/Web
- **Language**: Primarily Persian (Farsi) UI with English translation support
- **Dependencies**: Redux Toolkit, React Navigation (Native Stack), axios, react-i18next, expo-audio/video

## 2. Architecture & Entry Point

**App initialization flow** (`App.js`):
```javascript
GestureHandlerRootView → SafeAreaProvider → I18nextProvider → NavigationContainer
  → KeyboardProvider → Redux Provider → LoginProvider → SearchProvider → Stack.Navigator
```

**Provider responsibilities**:
- `LoginProvider` (`context/LoginProvider.js`): Manages global login modal visibility via `useLoginModal()` hook
- `SearchProvider` (`context/SearchProvider.js`): Global search state
- Redux store (`store.js`): Combines 4 slices — `auth`, `lang`, `user`, `contacts`

**Navigation structure**:
- Custom `BackHeader` component used for most screens (see `components/BackHeader.js`)
- Native Stack Navigator with `gestureEnabled: false` on main screens
- Feature-based screen organization: `screens/{explore,library,albums,account,auth,category,dictionary,musicalinstrument,resources,solfasaz}/`

## 3. State Management Patterns

**Redux slices** (all in `slices/`):
- `authSlice.js`: Simple slice with `token` and `deviceInfo` — use actions: `setToken`, `removeToken`, `setDeviceInfo`
- `userSlice.js`: Async thunk pattern with `createAsyncThunk`, handles `pending/fulfilled/rejected` states
- Other slices: `languageSlice`, `contactSlice`

**Pattern for async operations**:
```javascript
export const fetchUser = createAsyncThunk('user/fetchUser', async (token) => {
  return await axios.get(`${uri}/fetchUser`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
  }).then(res => res?.data).catch(err => console.log(err))
})
```

**Critical rule**: Never access token directly — always read from `state.auth.token` and dispatch actions for updates.

## 4. API Integration

**Base URLs** (`services/URL.js`):
```javascript
mainUri = 'https://solfabook.com'
uri = 'https://solfabook.com/api'
imageUri = 'https://solfabook.com/storage'
staticUri = 'https://solfabook.com/assets'
dlUrl = 'https://dl.solfabook.com/files'
```

**Standard API call pattern** (from `screens/explore/Explore.js`):
```javascript
const response = await axios.post(`${uri}/filesByCategories`, { page: 1 });
const data = response.data.data;
// Error handling:
catch (err) { 
  console.log(err); 
  handleError(err); // from helpers/Common.js
}
```

**Authorization header format**:
```javascript
headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
```

## 5. Pagination & List Patterns

**Standard FlatList pagination** (see `screens/explore/Explore.js`):
- Track: `page`, `isLoading`, `hasMore`, `refreshing`
- Use `onEndReached` with `onEndReachedThreshold={0.5}`
- Implement `RefreshControl` for pull-to-refresh
- Show `ActivityIndicator` footer when `isLoading`
- Check `!isLoading && hasMore` before triggering next page load
- Reset pattern: set `page=1`, clear data array, `hasMore=true`

## 6. Styling & Theming

**Theme system** (`theme/Color.js`):
- 13 predefined colors exported as `themeColor0` through `themeColor12`
- Each has `.color` (hex) and `.bgColor(opacity)` (rgba function)
- Example: `themeColor0.bgColor(1)` for primary purple, `themeColor4.bgColor(0.1)` for light backgrounds

**Shared styles** (`styles/NewStyles.js`):
- Exports: `deviceWidth`, `deviceHeight`, `CELL_SIZE`, gradient colors
- Standard patterns: `textStyle`, `inputSearchStyle`, `itemContainerStyle`, `dropDownContainerStyle`
- Font family: `'iransans'` is primary, also available: `'DimaShekasteh'`, `'VazirThin'`

**Layout conventions**:
- RTL text alignment: `textAlign: 'right'`
- Container padding: `paddingHorizontal: '5%'` is common
- Column gaps: `gap: 10` in `columnWrapperStyle`

## 7. Localization (i18n)

**Setup**: i18n initialized in `App.js` with default language `"fa"` (Farsi)
- Translation files: `assets/locales/{en,fa}.json`
- Usage in components:
```javascript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
return <Text>{t('keyName')}</Text>
```

## 8. Common Utilities (`helpers/Common.js`)

**Must-use helpers**:
- `handleError(err)` — standardized error handling, call in all catch blocks
- `showToastOrAlert(msg)` — cross-platform notifications (Android Toast vs iOS alert)
- `formatPrice(text)` — adds comma separators: `"1000000"` → `"1,000,000"`
- `formatDateTime(isoDate)` / `formatDate(isoDate)` — converts to Jalaali calendar
- `validateEmail(email)`, `validatePhone(phone)` — form validation
- `getColumnsCount()` — responsive column count based on device width
- `cleanText(text)` — strips HTML tags and entities

**Jalaali (Persian) calendar**:
- Uses `jalaali-js` library
- All date displays must use Jalaali format via `formatDate` or `formatDateTime`

## 9. Custom Components Patterns

**Commonly used components** (`components/`):
- `BackHeader` — standard back navigation header for Stack screens
- `CustomStatusBar` — wrap in SafeAreaView at top of screens
- `FilesProduct` — file/product card, accepts `type="vertical"|"horizontal"`, `explore` prop
- `BlankScreen` — empty state component for no-data scenarios
- `Loader` — full-screen loading indicator
- `SearchBar` — reusable search input
- `AudioPlayer`, `CustomImage`, `CustomImageCarousal` — media components

**Modal pattern** (`LoginProvider`):
- Use context-based modals for global UI (login, search)
- Access via custom hook: `const { showModal, hideModal } = useLoginModal()`

## 10. File Organization Rules

**Feature-based structure**:
- New screens → `screens/<feature-name>/ComponentName.js`
- Shared components → `components/ComponentName.js`
- Icons → `assets/svg/IconName.js` (React components, not raw SVG)

**Naming conventions**:
- Components: PascalCase (e.g., `FileDetail.js`)
- Utilities: camelCase (e.g., `handleError`)
- Constants: UPPER_SNAKE_CASE (e.g., `CELL_SIZE`)

## 11. Development Workflow

**Commands** (`package.json`):
```bash
npm start              # Expo dev server
npm run android        # Run on Android
npm run ios            # Run on iOS  
npm run web            # Run in web browser
```

**Key packages for features**:
- PDFs: `react-native-pdf`, `@config-plugins/react-native-pdf`
- Audio: `expo-audio`
- Video: `expo-video`
- Image picker: `expo-image-picker`
- File operations: `react-native-blob-util`, `expo-file-system`
- Share: `react-native-share`

**Device info**: Uses `expo-device` and `react-native-device-info` — stored in Redux `auth.deviceInfo`

## 12. Code Quality Guidelines

**DO**:
- Always use `handleError` in catch blocks, never silent fails
- Call `showToastOrAlert` for user feedback on actions
- Use Redux thunks for global state changes, local state for screen-only data
- Preserve existing axios patterns and header structure
- Check `loading` state before making duplicate API calls
- Implement proper pagination guards (`!isLoading && hasMore`)

**DON'T**:
- Never bypass `authSlice` actions for token management
- Avoid hardcoded API URLs — import from `services/URL.js`
- Don't mix different theme access patterns — use `themeColorX.bgColor(alpha)`
- Never add fonts without updating `useFonts` in `App.js`
- Don't use English date formats — always use Jalaali via helpers

## 13. Key Files for Context

When working on features, review:
- Navigation: `App.js` lines 62-179 (Stack.Navigator setup)
- API patterns: `slices/userSlice.js`, `screens/explore/Explore.js`
- Error handling: `helpers/Common.js` lines 122-180
- Theme usage: `theme/Color.js`, `styles/NewStyles.js`
- Auth flow: `slices/authSlice.js`, `context/LoginProvider.js`

---

**Questions or need expansion on**: testing setup, CI/CD, release builds, deep linking, or specific feature workflows? Ask for clarification.
