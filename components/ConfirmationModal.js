import { View, Modal, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import makeStyles, { deviceHeight } from '../styles/NewStyles';
import { themeColor3, themeColor4 } from '../theme/Color';
import TransparentButton from './TransparentButton';
import PairButton from './PairButton';

export default function ConfirmationModal({ title, message, action, confirmationModal, setConfirmationModal }) {

    const { t } = useTranslation();
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useMemo(() => makeStyles(lang), [lang]);
    return (
        <Modal animationType='fade' transparent={true} visible={confirmationModal} onRequestClose={() => { setConfirmationModal(!confirmationModal) }}>
            {/* <TouchableWithoutFeedback onPress={() => { setConfirmationModal(false) }}> */}
            <View style={[styles.container, NewStyles.center]}>
                <View style={[styles.modalView, NewStyles.border10]}>
                    <Text style={NewStyles.title10}>{title}</Text>
                    <Text style={NewStyles.text10}>{message}</Text>
                    <View style={[NewStyles.row, { justifyContent: 'flex-end', gap: 20 }]}>
                        <TransparentButton title={`${t('Yes')}`} onPress={() => { action(); setConfirmationModal(false) }} />
                        <TransparentButton title={`${t('No')}`} onPress={() => { setConfirmationModal(false) }} />
                    </View>
                </View>
            </View>
            {/* </TouchableWithoutFeedback> */}
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themeColor3.bgColor(0.5),
    },
    modalView: {
        height: deviceHeight * 0.17,
        width: '90%',
        backgroundColor: themeColor4.bgColor(1),
        paddingHorizontal: 20,
        justifyContent: 'space-evenly',
    },
});