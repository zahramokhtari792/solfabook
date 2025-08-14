import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useState } from 'react'
import Slider from '@react-native-community/slider';
import axios from 'axios';
import { uri } from '../services/URL';
import { themeColor0, themeColor1, themeColor10 } from '../theme/Color';
import Button from './Button';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { showToastOrAlert } from '../helpers/Common';

const RatingModal = ({ modal, setModal, publisher_id, action }) => {

    // const [loader, setLoader] = useState(false)
    const [score0, setScore0] = useState(0);
    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);
    const { t } = useTranslation()
    const userToken = useSelector(state => state?.auth?.token);

    const setScore = () => {
        axios.post(`${uri}/ratePublisher`, { rate: (score0 + score1 + score2) / 3, publisher_id: publisher_id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then(response => {
                action()
                showToastOrAlert(response?.data?.message)

            })
            .catch(error => console.log(error))
    }

    return (
        <Modal animationType='slide' visible={modal} transparent={true} >

            {/* {loader && <Loader />} */}

            <TouchableWithoutFeedback onPress={() => { setModal(false); }}>
                <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: themeColor10.bgColor(0.2) }}>
                    <View style={styles.modal}>
                        <Text style={{ fontSize: 16, color: themeColor0.bgColor(1), paddingHorizontal: 30, textAlign: 'center', fontFamily: 'iransans' }}>
                            {t('Share your opinion with us.')}
                        </Text>

                        <View style={{ width: '100%', alignItems: 'center', }}>
                            <Text style={{ textAlign: 'center', color: themeColor1.bgColor(1), fontSize: 14, fontFamily: 'iransans' }}>
                                {t("Content quality")}
                            </Text>
                            <Slider
                                style={{ width: '75%', height: 40, }}
                                minimumTrackTintColor={themeColor0.bgColor(1)}
                                maximumTrackTintColor={themeColor1.bgColor(1)}
                                thumbTintColor={themeColor0.bgColor(1)}
                                step={1}
                                minimumValue={0}
                                maximumValue={5}
                                value={score0}
                                onValueChange={(value) => { setScore0(value) }}
                            />

                            <Text style={{ textAlign: 'center', color: themeColor1.bgColor(1), fontSize: 14, fontFamily: 'iransans' }}>
                                {t("Credibility and history")}
                            </Text>
                            <Slider
                                style={{ width: '75%', height: 40, }}
                                minimumTrackTintColor={themeColor0.bgColor(1)}
                                maximumTrackTintColor={themeColor1.bgColor(1)}
                                thumbTintColor={themeColor0.bgColor(1)}
                                step={1}
                                minimumValue={0}
                                maximumValue={5}
                                value={score1}
                                onValueChange={(value) => { setScore1(value) }}
                            />

                            <Text style={{ textAlign: 'center', color: themeColor1.bgColor(1), fontSize: 14, fontFamily: 'iransans' }}>
                                {t("Trustworthiness")}
                            </Text>
                            <Slider
                                style={{ width: '75%', height: 40, }}
                                minimumTrackTintColor={themeColor0.bgColor(1)}
                                maximumTrackTintColor={themeColor1.bgColor(1)}
                                thumbTintColor={themeColor0.bgColor(1)}
                                step={1}
                                minimumValue={0}
                                maximumValue={5}
                                value={score2}
                                onValueChange={(value) => { setScore2(value) }}
                            />
                        </View>


                        <View style={{ width: '48%', }}>
                            <Button onPress={() => { setScore(), setModal(false) }} title={t('Post a comment')} />
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default RatingModal

const styles = StyleSheet.create({

    btn1: {
        width: '48%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        borderColor: themeColor0.bgColor(1),
        borderWidth: 1,
    },

    btn2: {
        width: '48%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: themeColor0.bgColor(1),

        elevation: 2,
        shadowColor: '#000',
        shadowRadius: 1,
        shadowOpacity: 0.3,
        shadowOffset: { x: 0.5, y: -0.5 },

    },

    modal: {
        height: '50%',
        width: '85%',
        backgroundColor: "#FFF",
        alignItems: "center",
        justifyContent: 'space-evenly',
        borderRadius: 30,

        elevation: 10,
        shadowColor: '#000',
        shadowRadius: 1,
        shadowOpacity: 0.3,
        shadowOffset: { x: 0, y: 10 },

    },

})