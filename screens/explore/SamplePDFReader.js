import { StyleSheet, Text, View } from 'react-native'
import React, { useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import makeStyles from '../../styles/NewStyles'
import Pdf from 'react-native-pdf'
import { dlUrl } from '../../services/URL'
import Loader from '../../components/Loader'
import { CaptureProtection } from 'react-native-capture-protection'
import { useTranslation } from 'react-i18next'

const SamplePDFReader = ({ route }) => {
    const params = route?.params;
    const sample_files = params?.sample_files?.[0];
    React.useEffect(() => {
        CaptureProtection.prevent();
        return () => {
            CaptureProtection.allow();
        };
    }, []);
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useMemo(() => makeStyles(lang), [lang]);
    return (
        <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'maximum' }}>
            <View style={{ flex: 1 }}>
                <Pdf maxScale={10} showsVerticalScrollIndicator enablePaging singlePage={false} trustAllCerts={false} source={{ uri: `${dlUrl}/${sample_files?.file_path}`, cache: false }} style={{ flex: 1, width: '100%' }} />
            </View>
        </SafeAreaView>
    )
}

export default SamplePDFReader

const styles = StyleSheet.create({})
