import { Dimensions, Modal, SafeAreaView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import Button from './Button'
import NewStyles from '../styles/NewStyles'
import { themeColor4 } from '../theme/Color'

const AlertModal = ({ visible, text, actionMoal, setVisible, textBtn }) => {
    return (
        <Modal transparent={true} visible={visible} animationType='slide' style={{}}>
            <TouchableWithoutFeedback onPress={() => { setVisible(false) }} style={{}}>

                <SafeAreaView style={[{flex:1}, NewStyles.center]}>
                    <View style={[styles.alertBox, NewStyles.center, NewStyles.shadow, NewStyles.border5]}>
                        <Text style={[NewStyles.text10,{textAlign:'center'}]}>{text}</Text>
                        <View style={{width:'60%', marginTop:20}}>
                            <Button title={textBtn} onPress={actionMoal} />
                        </View>
                    </View>
                </SafeAreaView>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default AlertModal

const styles = StyleSheet.create({
    alertBox: {
        backgroundColor: themeColor4.bgColor(1),
        height: 250,
        width: 300,
        padding: 15,
    }
})