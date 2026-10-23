import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useRef } from 'react';

import { useNewStyles } from '../styles/NewStyles';
import { themeColor0 } from '../theme/Color';
import { useTranslation } from 'react-i18next';

export default function Loader() {

    const animation = useRef();
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useNewStyles(lang);
    return (
        <View style={[styles.animationContainer, NewStyles.center]}>
            <ActivityIndicator
                size={'large'}
                color={themeColor0.bgColor(1)}
            />
        </View>
    )
}



const styles = StyleSheet.create({
    animationContainer: {
        flex: 1,
    },
});