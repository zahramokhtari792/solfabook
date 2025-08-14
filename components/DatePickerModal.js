import { View, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import React from 'react';
import DatePicker, { getFormatedDate } from 'react-native-modern-datepicker';

import NewStyles from '../styles/NewStyles';
import { themeColor1, themeColor4 } from '../theme/Color';

export default function DatePickerModal({ datePickerModal, setDatePickerModal, birthDate, setBirthDate }) {

    var date = new Date();

    return (
        <Modal animationType='fade' transparent={true} visible={datePickerModal} onRequestClose={() => { setDatePickerModal(!datePickerModal) }}>
            <TouchableWithoutFeedback onPress={() => { setDatePickerModal(false) }}>
                <View style={[styles.wrapper, NewStyles.center]}>
                    <View style={[styles.modalView, NewStyles.center]}>
                        <DatePicker
                            mode='calendar'
                            isGregorian={false}
                            options={{
                                defaultFont: 'iransans',
                                headerFont: 'iransans',
                                mainColor: themeColor1.bgColor(1)
                            }}
                            style={[styles.calendar, NewStyles.border10]}
                            selected={birthDate}
                            onDateChange={()=>{
                                
                            }}
                            onMonthYearChange={()=>{
                                
                            }}
                            current={getFormatedDate(new Date(date.getTime()), 'jYYYY/jMM/jDD')}
                            maximumDate={getFormatedDate(new Date(date.getTime()), 'jYYYY/jMM/jDD')}
                            onSelectedChange={(p) => {
                                setBirthDate(p.slice(0, 10));
                            }}
                        />
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
        height: '50%',
        marginHorizontal: '5%',
        backgroundColor: themeColor4.bgColor(1),
    },
    calendar: {
        position: 'absolute',
    }
});