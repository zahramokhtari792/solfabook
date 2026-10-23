import { View, Modal, StyleSheet, TouchableWithoutFeedback, Platform } from 'react-native';
import React from 'react';
import DatePicker, { getFormatedDate } from 'react-native-modern-datepicker';

import { useNewStyles, deviceWidth } from '../styles/NewStyles';
import { themeColor1, themeColor4, themePalettes } from '../theme/Color';
import { useAppTheme } from '../context/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Button from './Button';

export default function DatePickerModal({ datePickerModal, setDatePickerModal, birthDate, setBirthDate }) {

    var date = new Date();
    const { i18n, t } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useNewStyles(lang);
    const { colors } = useAppTheme();
    return (
        <Modal animationType='fade' transparent={true} visible={datePickerModal} onRequestClose={() => { setDatePickerModal(!datePickerModal) }}>
            <TouchableWithoutFeedback onPress={() => { if (Platform.OS !== 'web') { setDatePickerModal(false) } }}>
                <View style={[styles.wrapper, NewStyles.center]}>
                    <View style={[styles.modalView, { backgroundColor: colors.surface }, NewStyles.center, NewStyles.border10]}>
                        <DatePicker
                            mode='calendar'
                            isGregorian={false}
                            options={{
                                defaultFont: 'VazirBold',
                                headerFont: 'VazirBold',
                                mainColor: colors.textSecondary,
                                ...(colors.background !== themePalettes.light.background ? { backgroundColor: colors.surface, textDefaultColor: colors.text, textHeaderColor: colors.text, selectedTextColor: colors.onPrimary } : {})
                            }}
                            style={[styles.calendar, NewStyles.border10]}
                            selected={birthDate}
                            onDateChange={() => {

                            }}
                            onMonthYearChange={() => {

                            }}
                            current={getFormatedDate(new Date(date.getTime()), 'jYYYY/jMM/jDD')}
                            maximumDate={getFormatedDate(new Date(date.getTime()), 'jYYYY/jMM/jDD')}
                            onSelectedChange={(p) => {
                                setBirthDate(p.slice(0, 10));
                            }}
                        />
                    <View style={{ width: deviceWidth * 0.7,  }}>
                        <Button
                            title={t("Close")}
                            onPress={()=>{
                                setDatePickerModal(false)
                            }}
                        />
                    </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: themeColor1.bgColor(0.8),
    },
    modalView: {
        // height: '50%',
        marginHorizontal: '5%',
        backgroundColor: themeColor4.bgColor(1),
    },
    calendar: {
        width: deviceWidth * 0.85,
        height: 350,
    }
});