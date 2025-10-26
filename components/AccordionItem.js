import { View, Text, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import { cleanText } from '../helpers/Common';
import NewStyles, { deviceWidth } from '../styles/NewStyles';
import { themeColor0, themeColor4 } from '../theme/Color';

export default function AccordionItem({ item, index, active, setActive }) {
    return (
        <Pressable style={[styles.itemWrapper, NewStyles.shadow]} onPress={() => { if (active == item?.id) { setActive() } else { setActive(item?.id) } }}>
            <View style={[NewStyles.rowWrapper, { gap: 10 }]}>
                <Text style={NewStyles.title}>{index + 1}</Text>
                <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.title}</Text>
                <Ionicons name={active == item?.id ? "chevron-up" : "chevron-down"} size={15} color={themeColor0.bgColor(1)} />
            </View>
            {(active == item.id) && <Text style={[NewStyles.text10, { textAlign: 'right', flex: 1 }]}>{cleanText(item?.description)}</Text>}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    itemWrapper: {
        width: deviceWidth,
        backgroundColor: themeColor4.bgColor(1),
        paddingHorizontal: '5%',
        paddingVertical: 15,
        gap: 20
    },
})