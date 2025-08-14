import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import { themeColor0, themeColor1, themeColor4 } from '../theme/Color';
import NewStyles from '../styles/NewStyles';


const OptionsComponents = ({ icon, txt, onPress, }) => {
    return (
        <TouchableOpacity style={[styles.items,NewStyles.shadow, NewStyles.rowWrapper]} onPress={onPress}>
            <View style={NewStyles.row}>
                <View style={[NewStyles.center, { backgroundColor: themeColor1.bgColor(0.2), padding: 7 }, NewStyles.border5]}>
                    <Ionicons name={icon} color={themeColor0.bgColor(1)} size={18} />
                </View>
                <Text style={[NewStyles.text10, { paddingHorizontal: 10 }]}>{txt}</Text>
            </View>
            <Ionicons name='chevron-back' color={themeColor0.bgColor(1)} size={20} />
        </TouchableOpacity>

    )
}

export default OptionsComponents

const styles = StyleSheet.create({
    items: {
        height: 50,
        paddingHorizontal: 15,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: themeColor4.bgColor(1),
        alignItems: 'center',
    },
})