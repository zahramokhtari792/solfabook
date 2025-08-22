import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import NewStyles from '../../styles/NewStyles';
import { themeColor1, themeColor10, themeColor3 } from '../../theme/Color';
import { useTranslation } from 'react-i18next';

const ModalPlayer = ({visible, setVisible, audio, musicIndex, setMusicIndex, playing, setPlayNow}) => {
    const {t} = useTranslation()
    return (
        <Modal animationType='slide' visible={visible} onRequestClose={() => {
            setVisible(false)
        }}>
            <View style={[{ width: '100%', borderBottomColor: themeColor3.bgColor(0.5), borderBottomWidth: StyleSheet.hairlineWidth, padding: 10 }, NewStyles.row]}>
                <View style={[{ flex: 1, alignItems: 'flex-end' },]}>
                    <TouchableOpacity style={{ padding: 10, }} onPress={() => {
                        setVisible(false)
                    }}>
                        <Ionicons name='close' color={themeColor10.bgColor(1)} size={20} />
                    </TouchableOpacity>
                </View>
                <View style={[{ flex: 1 }, NewStyles.center]}>
                    <Text style={NewStyles.title10}>{t('Audio files')}</Text>
                </View>
                <View style={{ flex: 1 }}>

                </View>
            </View>
            <FlatList
                data={audio}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => {
                    return (
                        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: themeColor1.bgColor(1), width: '100%' }} />
                    )
                }}

                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item, index }) => {
                    return (
                        <TouchableOpacity onPress={() => {
                            setMusicIndex(index);
                            if (index == musicIndex) { setPlayNow(!playing); } else { setPlayNow(true); }
                        }} style={[NewStyles.row, { width: '90%', alignSelf: 'center', paddingHorizontal: 10, alignItems: 'center', paddingBottom: 15, marginTop: 20, gap: 35 }]}>
                            <Text style={[NewStyles.text10, { flex: 1, textAlign: 'left' }]}>{item?.title}</Text>
                            <View style={[NewStyles.rowWrapper, { gap: 35, width: '25%' }]}>
                                <View style={{ width: 20, aspectRatio: 1 }}>
                                    <Ionicons name={(index == musicIndex && playing) ? 'pause' : 'play'} color={themeColor10.bgColor(1)} size={20} />
                                </View>
                                <Text style={[NewStyles.text10, { minWidth: 30, textAlign: 'left' }]}>{index + 1}</Text>
                            </View>
                        </TouchableOpacity>
                    )
                }}
            />
        </Modal>
    )
}

export default ModalPlayer

const styles = StyleSheet.create({})