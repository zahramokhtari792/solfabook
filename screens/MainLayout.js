import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Home from './home/Home';
import MyLibrary from './library/MyLibrary';
import MusicalInstruments from './solfasaz/MusicalInstruments';
import Explore from './explore/Explore';
import HomeIcon from '../assets/svg/HomeIcon';
import CategoryIcon from '../assets/svg/CategoryIcon';
import MainBookIcon from '../assets/svg/MainBookIcon';
import MusicIcon from '../assets/svg/MusicIcon';
import LibararyIcon from '../assets/svg/LibararyIcon';
import Header from '../components/Header';
import Categories from './category/Categories';
import MyFiles from './library/MyFiles';
import AlbumTab from './albums/AlbumTab';
import { Ionicons } from '@expo/vector-icons';
import { langIsRTL } from '../styles/NewStyles';
import { useInternetStatus } from '../hooks/useInternetStatus';
import { useAppTheme } from '../context/ThemeProvider';

const Tab = createBottomTabNavigator();

export default function MainLayout() {

    const { t } = useTranslation();
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const isOnline = useInternetStatus();
    const { colors, isDark } = useAppTheme();
    return (
        <Tab.Navigator
            initialRouteName='Home'
            backBehavior='initialRoute'
            screenOptions={{
                headerShown: true,
                headerTitle: '',
                headerBackTitle: 'Back',
                headerTitleStyle: { fontFamily: langIsRTL(lang) ? 'VazirBold' : 'VazirThin' },
                headerTintColor: colors.text,
                tabBarStyle: [{ backgroundColor: colors.surface }, Platform.OS === 'web' ? { height: 70 } : {}],
                tabBarLabelStyle: { fontFamily: langIsRTL(lang) ? 'VazirBold' : 'VazirThin' },
                tabBarActiveTintColor: isDark ? colors.primaryText : colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                headerLeftContainerStyle: langIsRTL(lang) ? { paddingLeft: '5%' } : { paddingRight: '5%' },
                headerShadowVisible: false,
                header: () => {
                    return (
                        <Header />
                    )
                }


            }}
        >
            <Tab.Screen name='MyLibrary' component={MyLibrary}
                options={{
                    title: `${t('My Library')}`,
                    tabBarIcon: ({ color }) => { return <LibararyIcon color={color} /> },

                }}
            />
            {isOnline && <Tab.Screen name='AlbumTab' component={AlbumTab}
                options={{
                    title: `${t('Albums')}`,
                    tabBarIcon: ({ color }) => { return <Ionicons name="albums" size={28} color={color} /> },
                }}
            />}
            {isOnline && <Tab.Screen name='Explore' component={Explore}
                options={{
                    title: `${t('Explore')}`,
                    tabBarIcon: ({ color }) => { return <MainBookIcon color={color} /> },
                }}
            />}
            {isOnline && <Tab.Screen name='Categories' component={Categories}
                options={{
                    title: `${t('Categories')}`,
                    tabBarIcon: ({ color }) => { return <CategoryIcon color={color} /> },
                }}
            />}
            {isOnline && <Tab.Screen name='Home' component={Home}
                options={{
                    title: `${t('Home')}`,
                    tabBarIcon: ({ color }) => { return <HomeIcon color={color} /> }
                }}
            />}

        </Tab.Navigator >
    )
}

const styles = StyleSheet.create({
    text: {

    }
})