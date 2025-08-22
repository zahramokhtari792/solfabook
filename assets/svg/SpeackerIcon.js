import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Svg, { Path } from 'react-native-svg'

const SpeackerIcon = ({color, size="24"}) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path d="M2 10V14C2 16 3 17 5 17H6.43C6.8 17 7.17 17.11 7.49 17.3L10.41 19.13C12.93 20.71 15 19.56 15 16.59V7.41003C15 4.43003 12.93 3.29003 10.41 4.87003L7.49 6.70003C7.17 6.89003 6.8 7.00003 6.43 7.00003H5C3 7.00003 2 8.00003 2 10Z" stroke={color} strokeWidth={1.2} />
            <Path d="M18 8C19.78 10.37 19.78 13.63 18 16" stroke={color} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M19.83 5.5C22.72 9.35 22.72 14.65 19.83 18.5" stroke={color} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    )
}

export default SpeackerIcon

const styles = StyleSheet.create({})