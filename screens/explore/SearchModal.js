import { useAppTheme } from '../../context/ThemeProvider';
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useMemo, useState } from 'react'
import { useSearchModal } from '../../context/SearchProvider';
import { Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { themeColor0, themeColor1, themeColor10, themeColor4 } from '../../theme/Color';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { uri } from '../../services/URL';
import { handleError } from '../../helpers/Common';
import { useNewStyles, langIsRTL } from '../../styles/NewStyles';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const SearchModal = () => {
    const { t } = useTranslation()
    const navigation = useNavigation()
    const { searchModal, hideSearchModal } = useSearchModal();
    const [value, setValue] = useState();
    const [loader, setLoader] = useState(false)
    const user = useSelector(state => state?.user?.data)
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useNewStyles(lang);
    const { colors } = useAppTheme();
    const styles = useMemo(() => makeLocalStyles(colors), [colors]);
    const search = () => {
        setLoader(true)
        axios.post(`${uri}/searchInAll`, { search: value, user_id: user?.id }, { headers: { 'Accept-Language': lang } })
            .then((res) => {
                navigation.navigate('SearchResult', { data: res?.data, search: value })
                hideSearchModal()
                setValue()
            })
            .catch((err) => {
                console.log(err);

                handleError(err)
            })
            .finally(() => {
                setLoader(false)

            })
    }
    return (
        <Modal animationType='fade' style={{}} transparent={true} visible={searchModal} onRequestClose={() => { hideSearchModal() }}>

            <SafeAreaView edges={{ top: 'off', bottom: 'maximum' }} style={{ backgroundColor: themeColor10.bgColor(0.5), flex: 1, alignItems: 'center', }}>
                <View style={[{ alignItems: 'center', marginTop: '5%' }, Platform.OS === 'web' && { width: '100%' }]}>
                    <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: '5%', padding: 15 }} onPress={() => { hideSearchModal() }}>
                        <Ionicons name='close' color={colors.onPrimary} size={24} />
                    </TouchableOpacity>
                    <View style={styles.searchBar} >
                        <TouchableOpacity onPress={() => {
                            if (value && value?.trim()) {
                                search()
                            }
                        }}>
                            <Ionicons name='search' color={themeColor0.bgColor(1)} size={24} />
                        </TouchableOpacity>
                        <TextInput value={value} cursorColor={themeColor0.bgColor(1)} style={[styles.searchText, langIsRTL(lang) ? { paddingRight: 10 } : { paddingLeft: 10 }, { fontFamily: langIsRTL(lang) ? 'VazirBold' : 'VazirThin', }, Platform.OS === 'web' && NewStyles.noZoomInput]} placeholder={`${t('Search')}...`} placeholderTextColor={colors.textSecondary}
                            onEndEditing={() => {
                                if (value && value?.trim()) {
                                    search()
                                }
                            }}
                            onChangeText={(p) => {
                                setValue(p);
                            }}

                        />
                    </View>

                </View>
                {loader && <View style={[NewStyles.center, { flex: 1 }]}>
                    <ActivityIndicator color={colors.onPrimary} size={'large'} />
                </View>}
            </SafeAreaView>
        </Modal>
    )
}

export default SearchModal

const makeLocalStyles = (colors) => StyleSheet.create({
    searchBar: {
        width: '85%',
        height: 50,
        borderRadius: 20,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        flexDirection: 'row-reverse',
        elevation: 3,
        shadowColor: '#000',
        shadowRadius: 2,
        shadowOpacity: 0.5,
        shadowOffset: { x: 3, y: -3 },


    },
    searchText: {
        flex: 1,
        textAlign: 'right',
        fontSize: 16,
        color: themeColor0.bgColor(1)
    },
})