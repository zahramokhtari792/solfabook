import { View, Text, StyleSheet, Platform } from 'react-native';
import { useMemo, useRef } from 'react';

import makeStyles from '../styles/NewStyles'; 
import { themeColor0 } from '../theme/Color';
import { useTranslation } from 'react-i18next';

export default function Loader() {

    const animation = useRef();
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useMemo(() => makeStyles(lang), [lang]);
    return (
        <View style={[styles.animationContainer, NewStyles.center]}>
            

        </View>
    )
}



const styles = StyleSheet.create({
    animationContainer: {
        flex: 1,
    },
});