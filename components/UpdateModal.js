import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { themeColor0, themeColor1, themeColor10, themeColor3, themeColor4 } from '../theme/Color';
import { makeStyles } from '../styles/NewStyles';
import { useTranslation } from 'react-i18next';

const UpdateModal = ({ visible, onClose, updateInfo }) => {

    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useMemo(() => makeStyles(lang), [lang]);

    if (!updateInfo) {
        return null;
    }

    const handleUpdate = () => {
        const url = Platform.OS === 'android' ? updateInfo.android_url : updateInfo.ios_url;
        if (url) {
            Linking.openURL(url);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={updateInfo.force_update ? undefined : onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: themeColor4.bgColor(1) }, NewStyles.shadow]}>
                    {/* Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: themeColor0.bgColor(0.1) }]}>
                        <Ionicons name="rocket-outline" size={60} color={themeColor0.bgColor(1)} />
                    </View>

                    {/* Title */}
                    <Text style={[NewStyles.title10, styles.title]}>
                        {updateInfo.force_update ? '⚠️ به‌روزرسانی ضروری' : '🎉 نسخه جدید آماده است!'}
                    </Text>

                    {/* Version Info */}
                    <View style={[styles.versionContainer, NewStyles.row]}>
                        <Text style={[NewStyles.text10, styles.versionText]}>
                            نسخه فعلی: <Text style={[NewStyles.title10, styles.versionNumber]}>{updateInfo.current_version}</Text>
                        </Text>
                        <Ionicons name="arrow-back" size={20} color={themeColor3.bgColor(1)} />
                        <Text style={[NewStyles.text10, styles.versionText]}>
                            نسخه جدید: <Text style={[NewStyles.title10, styles.versionNumber, { color: themeColor0.bgColor(1) }]}>{updateInfo.latest_version}</Text>
                        </Text>
                    </View>

                    {/* Description */}
                    {updateInfo.description && (
                        <View style={[styles.descriptionContainer, { backgroundColor: themeColor1.bgColor(0.5) }]}>
                            <Text style={[NewStyles.text10, styles.description]}>{updateInfo.description}</Text>
                        </View>
                    )}

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.updateButton, { backgroundColor: themeColor0.bgColor(1) }, NewStyles.row]}
                            onPress={handleUpdate}
                        >
                            <Ionicons name="download-outline" size={20} color="#fff" />
                            <Text style={[NewStyles.title4]}>به‌روزرسانی</Text>
                        </TouchableOpacity>

                        {!updateInfo.force_update && (
                            <TouchableOpacity
                                style={[styles.laterButton, { borderColor: themeColor3.bgColor(0.5) }]}
                                onPress={onClose}
                            >
                                <Text style={[NewStyles.text10, { color: themeColor3.bgColor(1) }]}>بعداً</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {updateInfo.force_update && (
                        <Text style={[NewStyles.text3, styles.forceUpdateNote]}>
                            برای ادامه استفاده از برنامه، به‌روزرسانی الزامی است.
                        </Text>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: themeColor10.bgColor(0.7),
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',

    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 15,
    },
    versionContainer: {
        gap: 10,
        marginBottom: 20,
    },
    versionText: {
        fontSize: 14,
    },
    versionNumber: {
        fontSize: 16,
    },
    descriptionContainer: {
        width: '100%',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    description: {
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        gap: 10,
    },
    updateButton: {
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 10,
        borderRadius: 10,
    },
    updateButtonText: {
    },
    laterButton: {
        alignItems: 'center',
        paddingVertical: 15,
        borderRadius: 10,
        borderWidth: 1,
    },
    forceUpdateNote: {
        textAlign: 'center',
        marginTop: 15,
        fontSize: 12,
    },
});

export default UpdateModal;
