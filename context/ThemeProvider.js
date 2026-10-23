import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themePalettes } from '../theme/Color';

// Separate key so login/logout and cached API responses cannot overwrite the theme.
export const THEME_STORAGE_KEY = '@solfabook/themeMode';
export const THEME_MODES = Object.freeze({
    LIGHT: 'light',
    DARK: 'dark',
});

const ThemeContext = createContext(null);

const isValidThemeMode = (mode) =>
    mode === THEME_MODES.LIGHT ||
    mode === THEME_MODES.DARK;

export const ThemeProvider = ({ children }) => {
    // Keep Light as the default, independently of device appearance.
    const [themeMode, setThemeModeState] = useState(THEME_MODES.LIGHT);
    const [isReady, setIsReady] = useState(false);
    const writeQueue = useRef(Promise.resolve());

    useEffect(() => {
        let mounted = true;

        const restoreTheme = async () => {
            try {
                const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (mounted && isValidThemeMode(savedMode)) {
                    setThemeModeState(savedMode);
                }
            } catch (error) {
                // A storage failure should never prevent the app from opening.
                console.warn('Unable to restore app theme:', error);
            } finally {
                if (mounted) setIsReady(true);
            }
        };

        restoreTheme();
        return () => { mounted = false; };
    }, []);

    // Serialize writes, so rapid theme changes cannot persist out of order.
    useEffect(() => {
        if (!isReady) return;

        writeQueue.current = writeQueue.current
            .catch(() => {})
            .then(() => AsyncStorage.setItem(THEME_STORAGE_KEY, themeMode))
            .catch((error) => {
                console.warn('Unable to save app theme:', error);
            });
    }, [themeMode, isReady]);

    const setThemeMode = useCallback((nextMode) => {
        if (!isValidThemeMode(nextMode)) {
            console.warn('Unsupported app theme mode:', nextMode);
            return;
        }
        setThemeModeState(nextMode);
    }, []);

    // The selected theme is always explicit (Light or Dark).
    const resolvedTheme = themeMode;
    const colors = themePalettes[resolvedTheme];

    const value = useMemo(() => ({
        themeMode,
        setThemeMode,
        resolvedTheme,
        colors,
        isDark: resolvedTheme === THEME_MODES.DARK,
        isReady,
    }), [themeMode, setThemeMode, resolvedTheme, colors, isReady]);

    // Avoid flashing the light theme before a saved dark choice is restored.
    return (
        <ThemeContext.Provider value={value}>
            {isReady ? children : null}
        </ThemeContext.Provider>
    );
};

export const useAppTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useAppTheme must be used inside ThemeProvider');
    }
    return context;
};
