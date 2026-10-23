import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import { useNewStyles } from '../../styles/NewStyles';
import { useTranslation } from 'react-i18next';
import { themeColor0, themeColor1 } from '../../theme/Color';
import { SafeAreaView } from 'react-native-safe-area-context';

const FullDescription = ({ route }) => {
    const params = route?.params;
    const { t } = useTranslation()
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useNewStyles(lang);
    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={[NewStyles.container,]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: '5%', paddingVertical: '5%' }}>

                <Text style={NewStyles.text10}>{params?.des}</Text>
                <Text style={NewStyles.text10}>{params?.description}</Text>
                <View style={{ alignItems: 'flex-end', gap: 10 }}>
                    <Text style={[NewStyles.text, { marginTop: 10 }]}>{t('Category')}:</Text>
                    <View style={[{ borderWidth: StyleSheet.hairlineWidth, borderColor: themeColor1.bgColor(1), padding: 10 }, NewStyles.border5,]}>
                        <Text style={NewStyles.text10}>{params?.categoryName}</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default FullDescription

const styles = StyleSheet.create({})