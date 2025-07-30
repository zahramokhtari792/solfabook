import { StyleSheet, View } from 'react-native';
import React from 'react';

import NewStyles from '../styles/NewStyles';
import Dot from './Dot'; 

export default function Pagination({ data, x, size }) {
    return (
        <View style={[styles.paginationContainer, NewStyles.center]}>
            {data.map((_, i) => {
                return <Dot key={i} x={x} index={i} size={size} />;
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    paginationContainer: {
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center',
        flexDirection: 'row',
    },
})
