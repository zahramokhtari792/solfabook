import React from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const MAX_ZOOM = 4;

function ZoomCanvas({ uri }) {
    const scale = useSharedValue(1);
    const lastScale = useSharedValue(1);
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const lastX = useSharedValue(0);
    const lastY = useSharedValue(0);

    const pinch = Gesture.Pinch()
        .onUpdate((event) => {
            scale.value = Math.max(1, Math.min(MAX_ZOOM, lastScale.value * event.scale));
        })
        .onEnd(() => {
            lastScale.value = scale.value;
            if (scale.value <= 1) {
                offsetX.value = withTiming(0);
                offsetY.value = withTiming(0);
                lastX.value = 0;
                lastY.value = 0;
            }
        });

    const pan = Gesture.Pan()
        .minPointers(1)
        .onUpdate((event) => {
            if (scale.value > 1) {
                offsetX.value = lastX.value + event.translationX;
                offsetY.value = lastY.value + event.translationY;
            }
        })
        .onEnd(() => {
            lastX.value = offsetX.value;
            lastY.value = offsetY.value;
        });

    const doubleTap = Gesture.Tap().numberOfTaps(2).onEnd((_event, success) => {
        if (!success) return;
        const next = scale.value > 1 ? 1 : 2.5;
        scale.value = withTiming(next);
        lastScale.value = next;
        if (next === 1) {
            offsetX.value = withTiming(0);
            offsetY.value = withTiming(0);
            lastX.value = 0;
            lastY.value = 0;
        }
    });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: offsetX.value },
            { translateY: offsetY.value },
            { scale: scale.value },
        ],
    }));

    return (
        <GestureDetector gesture={Gesture.Simultaneous(pinch, pan, doubleTap)}>
            <Animated.View style={[styles.canvas, animatedStyle]}>
                <Image source={{ uri }} resizeMode="contain" style={styles.image} />
            </Animated.View>
        </GestureDetector>
    );
}

export default function InstrumentImageZoom({ uri, onClose }) {
    return (
        <Modal visible={Boolean(uri)} transparent={false} animationType="fade" onRequestClose={onClose}>
            <GestureHandlerRootView style={styles.modal}>
                {uri ? <ZoomCanvas key={uri} uri={uri} /> : null}
                <Pressable
                    onPress={onClose}
                    style={styles.close}
                    accessibilityRole="button"
                    accessibilityLabel="Close image"
                >
                    <Ionicons name="close" size={27} color="#FFFFFF" />
                </Pressable>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: { flex: 1, backgroundColor: '#000000', justifyContent: 'center' },
    canvas: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    image: { width: '100%', height: '100%' },
    close: {
        position: 'absolute', top: 42, right: 18, zIndex: 2,
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: 'rgba(30,30,30,0.75)',
        justifyContent: 'center', alignItems: 'center',
    },
});
