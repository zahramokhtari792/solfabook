import { FlatList, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNewStyles } from '../../styles/NewStyles';
import axios from 'axios'
import { uri } from '../../services/URL'
import { handleError } from '../../helpers/Common'
import Loader from '../../components/Loader'
import { themeColor4 } from '../../theme/Color'
import { useAppTheme } from '../../context/ThemeProvider'
import Button from '../../components/Button'
import { BlurView } from 'expo-blur'
import { useTranslation } from 'react-i18next'

const MusicalInstrumentIntro = ({ navigation }) => {
    const [data, setData] = useState([]);
    const [loader, setLoader] = useState(true)
    const { i18n, t } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useNewStyles(lang);
    const { colors, isDark } = useAppTheme();
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
                contentContainerStyle={{ paddingHorizontal: 30, paddingTop: 12 }}
                renderItem={({ item }) => {
                    return (
                        <BlurView intensity={10} tint={isDark ? 'dark' : 'light'} style={{ backgroundColor: isDark ? 'rgba(36, 36, 36, 0.88)' : themeColor4.bgColor(0.8), borderRadius: 10, paddingHorizontal: 10 }}>

                            <Text style={[NewStyles.heading, { fontSize: 20, color: isDark ? colors.text : colors.primary, textAlign: 'center' }]}>{item?.title}</Text>
                            <Text style={[NewStyles.text10, { fontSize: 15 }]}>{item?.description}</Text>
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
