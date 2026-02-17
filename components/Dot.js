import { StyleSheet } from 'react-native';
import React, { useMemo } from 'react';
import Animated, { useAnimatedStyle, interpolate, Extrapolation, } from 'react-native-reanimated';

import makeStyles from '../styles/NewStyles';
import { themeColor0 } from '../theme/Color';
import { useTranslation } from 'react-i18next';

export default function Dot({ x, index, size }) {
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useMemo(() => makeStyles(lang), [lang]);
    const animatedDotStyle = useAnimatedStyle(() => {
        const widthAnimation = interpolate(
            x.value,
            [(index - 1) * size, index * size, (index + 1) * size],
            [10, 20, 10],
            Extrapolation.CLAMP,
        );
        const opacityAnimation = interpolate(
            x.value,
            [(index - 1) * size, index * size, (index + 1) * size],
            [0.5, 1, 0.5],
            Extrapolation.CLAMP,
        );
        return {
            width: widthAnimation,
            opacity: opacityAnimation,
        };
    });
    return <Animated.View style={[styles.dots, NewStyles.border5, animatedDotStyle]} />;
};

const styles = StyleSheet.create({
    dots: {
        height: 5,
        backgroundColor: themeColor0.bgColor(1),
        marginHorizontal: 3,
    },
})