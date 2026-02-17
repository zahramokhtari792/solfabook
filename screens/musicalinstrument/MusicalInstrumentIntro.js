import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import makeStyles from '../../styles/NewStyles'
import axios from 'axios'
import { uri } from '../../services/URL'
import { handleError } from '../../helpers/Common'
import Loader from '../../components/Loader'
import { themeColor0, themeColor4 } from '../../theme/Color'
import Button from '../../components/Button'
import { BlurView } from 'expo-blur'
import { useTranslation } from 'react-i18next'

const MusicalInstrumentIntro = ({ navigation }) => {
    const [data, setData] = useState([]);
    const [loader, setLoader] = useState(true)
    const { i18n, t } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useMemo(() => makeStyles(lang), [lang]);
    const allIntro = () => {
        axios.get(`${uri}/allIntro?lang=${lang}`)
            .then((res) => {
                setData(res?.data)
            })
            .catch((err) => {
                handleError(err)
            })
            .finally(() => {
                setLoader(false)
            })
    }
    useEffect(() => {
        allIntro()
    }, [])
    if (loader) {
        return (
            <Loader />
        )
    }
    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <FlatList
                data={data}
                ListHeaderComponent={() => {
                    return (
                        <Text style={{ textAlign: 'center', fontFamily: 'DimaShekasteh', color: themeColor0, fontSize: 40, }}>🎼 {t("SolfaSaz")} 🎼</Text>
                    )
                }}
                contentContainerStyle={{ paddingHorizontal: 30 }}
                renderItem={({ item }) => {
                    return (
                        <BlurView intensity={10} style={{ backgroundColor: themeColor4.bgColor(0.8), borderRadius: 10, paddingHorizontal: 10 }}>

                            <Text style={{ fontFamily: 'DimaShekasteh', fontSize: 20, color: themeColor0.bgColor(1), textAlign: 'center' }}>{item?.title}</Text>
                            <Text style={{ fontFamily: 'VazirBold', fontSize: 15, textAlign: 'right' }}>{item?.description}</Text>
                        </BlurView>
                    )
                }}
                ListFooterComponent={() => {
                    return (
                        <View style={{ marginVertical: 20 }}>

                            <Button title={t("Enter SolfaSaz")} onPress={() => {
                                navigation.navigate('MusicalInstrument')
                            }} />
                        </View>
                    )
                }}
            />
        </SafeAreaView>
    )
}

export default MusicalInstrumentIntro

const styles = StyleSheet.create({})