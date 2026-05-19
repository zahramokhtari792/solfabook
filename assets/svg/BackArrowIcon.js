import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Path, Svg } from 'react-native-svg'
import i18next from 'i18next'
import { langIsRTL } from '../../styles/NewStyles'

const BackArrowIcon = ({ color }) => {
    return (
        <>
            {langIsRTL(i18next.language) ? <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <Path d="M9.57 5.92993L3.5 11.9999L9.57 18.0699" stroke={color} strokeWidth={1.5} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M20.5 12H3.67004" stroke={color} strokeWidth={1.5} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
                :
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <Path d="M14.4301 5.92993L20.5001 11.9999L14.4301 18.0699" stroke={color} strokeWidth={1.5} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M3.5 12H20.33" stroke={color} strokeWidth={1.5} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>}

        </>
    )
}

export default BackArrowIcon

const styles = StyleSheet.create({})