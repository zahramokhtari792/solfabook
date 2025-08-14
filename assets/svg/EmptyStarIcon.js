import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Path, Svg } from 'react-native-svg'

const EmptyStarIcon = ({color,colorfill,width="22",height="22"}) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path d="M8.4 1L10.6868 5.87076L15.8 6.66019L12.1 10.4494L12.9772 15.8L8.40439 13.2712L3.82632 15.7982L4.70351 10.4477L1 6.65668L6.11316 5.86726L8.4 1Z" stroke={color} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" fill={colorfill} />
        </Svg>
    )
}

export default EmptyStarIcon

const styles = StyleSheet.create({})