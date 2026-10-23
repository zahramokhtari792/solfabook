import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { Ionicons } from '@expo/vector-icons';
import { useNewStyles } from '../../styles/NewStyles';
import { themeColor1, themeColor10, themeColor3 } from '../../theme/Color';
import { useAppTheme } from '../../context/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const ModalPlayer = ({
    visible,
    setVisible,
    audio,
    musicIndex,
    setMusicIndex,
    playing,
    setPlaying,
    downloadingTrackId,
    downloadedTracks,
    onDownloadTrack,
    onPreferLocal,
}) => {
    const { t } = useTranslation()
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useNewStyles(lang);
    const { colors } = useAppTheme();
    const navigation = useNavigation();
    const user = useSelector(state=>state.user?.data)
    const [pendingIndex, setPendingIndex] = useState(null);
    const [pendingPlay, setPendingPlay] = useState(false);

    useEffect(() => {
        if (!setPlaying) return;
        if (pendingIndex === null) return;
        if (pendingIndex !== musicIndex) return;
        if (pendingPlay) {
            setPlaying(true);
        }
        if (playing) {
            setPendingIndex(null);
            setPendingPlay(false);
        }
    }, [musicIndex, pendingIndex, pendingPlay, playing, setPlaying]);
    return (
        <Modal animationType='slide' visible={visible} onRequestClose={() => {
            setVisible(false)
        }}>
            <View style={[{ backgroundColor: colors.background, width: '100%', borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth, padding: 10 }, NewStyles.row]}>
                <View style={[{ flex: 1, alignItems: 'flex-end' },]}>
                    <TouchableOpacity style={{ padding: 10, }} onPress={() => {
                        setVisible(false)
                    }}>
                        <Ionicons name='close' color={colors.text} size={20} />
                    </TouchableOpacity>
                </View>
                <View style={[{ flex: 1 }, NewStyles.center]}>
                    <Text style={NewStyles.title10}>{t('Audio files')}</Text>
                </View>
                <View style={{ flex: 1 }}>

                </View>
            </View>
            <FlatList
                style={{ backgroundColor: colors.background }}
                data={audio}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => {
                    return (
                        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: themeColor1.bgColor(1), width: '100%' }} />
                    )
                }}

                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item, index }) => {
                    const trackId = item?.id ?? item?.file_gallery_id ?? index;
                    const isDownloaded = !!downloadedTracks?.[trackId];
                    const isDownloadingTrack = downloadingTrackId === trackId;
                    return (
                        <TouchableOpacity onPress={() => {
                            setMusicIndex(index);
                            if (isDownloaded && onPreferLocal) {
                                onPreferLocal(trackId);
                            }
                            if (!setPlaying) return;
                            if (index === musicIndex) {
                                setPendingIndex(null);
                                setPendingPlay(false);
                                setPlaying((p) => !p);
                            } else {
                                setPendingIndex(index);
                                setPendingPlay(true);
                            }
                        }} style={[NewStyles.row, { width: '90%', alignSelf: 'center', paddingHorizontal: 10, alignItems: 'center', paddingBottom: 15, marginTop: 20, gap: 35 }]}>
                            <Text style={[NewStyles.text10, { flex: 1, textAlign: 'left' }]}>{item?.title}</Text>
                            <View style={[NewStyles.rowWrapper, { gap: 20,  }]}>
                                {onDownloadTrack && (
                                    <TouchableOpacity
                                        disabled={isDownloadingTrack}
                                        onPress={() => {
                                            if (isDownloaded) {
                                                onPreferLocal && onPreferLocal(trackId);
                                            } else {
                                                if (user?.is_offline_mode == 1) {
                                                    onDownloadTrack(item, index);
                                                } else {
                                                    navigation.navigate('Subscription');
                                                }
                                            }
                                        }}
                                        style={{ width: 20, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        {isDownloadingTrack ? (
                                            <ActivityIndicator size="small" color={colors.text} />
                                        ) : isDownloaded ? (
                                            <Ionicons name="checkmark-circle" color={colors.text} size={18} />
                                        ) : (
                                            <Ionicons name="download-outline" color={colors.text} size={18} />
                                        )}
                                    </TouchableOpacity>
                                )}
                                <View style={{ width: 20, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    {pendingIndex === index ? (
                                        <ActivityIndicator size="small" color={colors.text} />
                                    ) : (
                                        <Ionicons name={(index == musicIndex && playing) ? 'pause' : 'play'} color={colors.text} size={20} />
                                    )}
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
