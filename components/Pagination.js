import { StyleSheet, View } from 'react-native';
import React, { useMemo } from 'react';

import makeStyles from '../styles/NewStyles';
import Dot from './Dot';
import { useTranslation } from 'react-i18next';

export default function Pagination({ data, x, size }) {
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useMemo(() => makeStyles(lang), [lang]);
    return (
        <View style={[styles.paginationContainer, NewStyles.center]}>
            {data.map((_, i) => {
                return <Dot key={i} x={x} index={i} size={size} />;
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    paginationContainer: {
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center',
        flexDirection: 'row',
    },
})
