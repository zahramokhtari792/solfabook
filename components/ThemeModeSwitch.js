import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, PanResponder, Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// A two-state switch. It follows our brand-independent day/night illustration,
// while onValueChange is the single source of truth for the selected app theme.
// No device theme or additional dependency is used.
const TRACK_WIDTH = 80;
const TRACK_HEIGHT = 44;
const THUMB_SIZE = 36;
const TRACK_PADDING = 4;
const TRAVEL = TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING * 2;
const DRAG_THRESHOLD = 12;

const ThemeModeSwitch = ({ value = false, onValueChange, accessibilityLabel }) => {
    const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: value ? 1 : 0,
            duration: 180,
            useNativeDriver: Platform.OS !== 'web',
        }).start();
    }, [progress, value]);

    const changeValue = useCallback((nextValue) => {
        if (nextValue !== value && typeof onValueChange === 'function') {
            onValueChange(nextValue);
        }
    }, [onValueChange, value]);

    // A tap toggles; dragging right chooses Dark and left chooses Light.
    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderRelease: (_event, gesture) => {
            const dx = gesture?.dx ?? 0;
            changeValue(Math.abs(dx) > DRAG_THRESHOLD ? dx > 0 : !value);
        },
        onPanResponderTerminationRequest: () => true,
    }), [changeValue, value]);

    const thumbPosition = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, TRAVEL],
    });

    return (
        <View
            {...panResponder.panHandlers}
            style={[styles.track, { backgroundColor: value ? '#0b2e3f' : '#fae9b3' }]}
            accessible
            accessibilityRole="switch"
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{ checked: value }}
            accessibilityActions={[{ name: 'activate' }]}
            onAccessibilityAction={(event) => {
                if (event.nativeEvent.actionName === 'activate') {
                    changeValue(!value);
                }
            }}
            testID="theme-mode-switch"
        >
            
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.thumb,
                    {
                        backgroundColor: value ? '#31b1ed' : '#f1c044',
                        transform: [{ translateX: thumbPosition }],
                    },
                ]}
            >
                {value && <Ionicons name="moon" size={20} color="#fff" />}
            </Animated.View>
        </View>
    );
};

export default ThemeModeSwitch;

const styles = StyleSheet.create({
    track: {
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        justifyContent: 'center',
        overflow: 'hidden',
        // Keep the decoration left-to-right even when the app is in RTL.
        direction: 'ltr',
    },
    decorations: {
        ...StyleSheet.absoluteFill,
    },
    thumb: {
        position: 'absolute',
        left: TRACK_PADDING,
        top: TRACK_PADDING,
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 2,
    },
    cloudOne: { position: 'absolute', right: 18, top: 3 },
    cloudTwo: { position: 'absolute', right: 46, bottom: 4 },
    cloudThree: { position: 'absolute', right: 7, bottom: 5 },
    starOne: { position: 'absolute', left: 20, top: 8 },
    starTwo: { position: 'absolute', left: 48, bottom: 7 },
    starThree: { position: 'absolute', left: 62, top: 10 },
});
