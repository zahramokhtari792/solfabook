import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Path, Svg } from 'react-native-svg'

const BackArrowIcon = ({color}) => {
    return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path d="M9.57 5.92993L3.5 11.9999L9.57 18.0699" stroke={color} strokeWidth={1.5} stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M20.5 12H3.67004" stroke={color} strokeWidth={1.5} stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    )
}

export default BackArrowIcon

const styles = StyleSheet.create({})