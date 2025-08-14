
import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { useNavigationState } from '@react-navigation/native';

import { themeColor0, themeColor4 } from '../theme/Color';

export default function CustomStatusBar() {

    const navigationState = useNavigationState(state => state);
    const currentRouteName = navigationState.routes[navigationState.index].name;

    const statusBarStyle = Platform.OS==='android' ? 'default' : 'default';
    const statusBarBackgroundColor = Platform.OS==='android' ? themeColor0.bgColor(1) : themeColor0.bgColor(1);

    return (
        <StatusBar barStyle={'dark-content'} backgroundColor={statusBarBackgroundColor} animated={true} StatusBarAnimation='fade' />
    )
}
