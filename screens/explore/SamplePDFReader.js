import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import NewStyles from '../../styles/NewStyles'
import Pdf from 'react-native-pdf'
import { dlUrl } from '../../services/URL'
import Loader from '../../components/Loader'
import { usePreventScreenCapture } from 'expo-screen-capture'

const SamplePDFReader = ({ route }) => {
    const params = route?.params;
    const sample_files = params?.sample_files?.[0];
    usePreventScreenCapture();

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