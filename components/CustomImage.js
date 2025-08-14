import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useLayoutEffect, useState } from 'react';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';

import NewStyles, { deviceHeight, deviceWidth } from '../styles/NewStyles';
import { imageUri } from '../services/URL';
import { themeColor0, themeColor4 } from '../theme/Color';
import { ImageBackground } from 'expo-image';

export default function CustomImage({ item, x, index, size, spacer }) {

    const [aspectRatio, setAspectRatio] = useState(1);

    // Get Image Width and Height to Calculate AspectRatio
    useLayoutEffect(() => {
        if (item?.image_path) {
            // const { width, height } = Image.resolveAssetSource(item?.image_path);
            const width = 6000;
            const height = 4000;
            setAspectRatio(width / height);
        }
    }, [item?.image_path]);

    const style = useAnimatedStyle(() => {
        const scale = interpolate(
            x.value,
            [(index - 2) * size, (index - 1) * size, index * size],
            [0.95, 1, 0.95],
        );
        return {
            transform: [{ scale }],
        };
    });

    if (!item?.image_path) {
        return <View style={{ width: spacer }} key={index} />;
    }
    

    return (
        <View style={{ overflow: 'hidden', width: size }} key={index}>
            <Animated.View style={[styles.imageContainer, style]}>
                <ImageBackground style={styles.imageBackground} source={{ uri: `${imageUri}/${item?.image_path}` }} contentFit="cover">
                    {item?.link && <Pressable style={[NewStyles.row, NewStyles.border5, { backgroundColor: themeColor0.bgColor(0.5), gap: 5, padding: 5 }]} onPress={() => { Linking?.openURL(`${item?.link}`) }}>
                        <Ionicons name="information-circle-outline" size={15} color={themeColor4.bgColor(1)} />
                        <Text style={NewStyles.text4}>اطلاعات بیشتر </Text>
                    </Pressable>}
                </ImageBackground>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    imageContainer: {
        overflow: 'hidden',
    },
    imageBackground: {
        width: '100%',
        // height: deviceWidth >= 768 ? deviceHeight*0.4 : deviceHeight * 0.29,
        padding: '2.5%',
        aspectRatio:1.6,
        alignItems: 'flex-start',
        justifyContent: 'flex-end'
    },
})