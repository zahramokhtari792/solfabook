import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Svg, { Circle, Rect, Path, G, Defs, ClipPath } from 'react-native-svg';
import { themeColor4 } from '../../theme/Color';
const UserIcon = ({ color }) => {
    return (
        <Svg width="22" height="24" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <G clip-path="url(#clip0_5127_1736)">
                <Path d="M9.05079 13.8407C10.0157 14.3839 11.1736 14.5649 12.2157 14.1626C14.1455 13.4182 15.7087 11.7686 16.5771 9.83734C17.5806 7.64455 17.214 4.98906 15.9982 2.97732C14.7052 0.784533 12.042 -0.523095 9.59114 0.201129C6.05957 1.14664 4.05255 5.53223 5.13325 9.07288C5.78939 11.1047 7.23676 12.8549 9.05079 13.8407Z" fill={color} />
                <Path d="M15.535 13.5591C14.3192 15.0276 12.6596 16.4157 10.6912 16.3152C8.97361 16.0939 7.54554 14.8868 6.46484 13.5591C2.60519 15.3495 -0.0386677 19.5943 -7.12246e-05 24C7.33326 24 14.6666 24 21.9999 24C22.0578 19.5943 19.3947 15.3495 15.535 13.5591Z" fill={color} />
            </G>
            <Defs>
                <ClipPath id="clip0_5127_1736">
                    <Rect width="22" height="24" fill={themeColor4.bgColor(1)} />
                </ClipPath>
            </Defs>
        </Svg>
    )
}

export default UserIcon

const styles = StyleSheet.create({})