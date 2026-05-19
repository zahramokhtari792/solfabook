import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { themeColor0, themeColor3, themeColor10, themeColor4, themeColor5, themeColor1, } from '../theme/Color';
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

const Tab = createBottomTabNavigator();

export default function MainLayout() {

    const { t } = useTranslation();
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    return (
        <Tab.Navigator
            initialRouteName='Home'
            backBehavior='initialRoute'
            screenOptions={{
                headerShown: true,
                headerTitle: '',
                headerBackTitle: 'Back',
                headerTitleStyle: { fontFamily: langIsRTL(lang) ? 'VazirBold' : 'VazirThin'},
                headerTintColor: themeColor10.bgColor(1),
                tabBarStyle:[ { backgroundColor: themeColor4.bgColor(1) }, Platform.OS === 'web' ? { height: 70 } : {}],
                tabBarLabelStyle: { fontFamily: langIsRTL(lang) ? 'VazirBold' : 'VazirThin'},
                tabBarActiveTintColor: themeColor0.bgColor(1),
                tabBarInactiveTintColor: themeColor1.bgColor(1),
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
            <Tab.Screen name='AlbumTab' component={AlbumTab}
                options={{
                    title: `${t('Albums')}`,
                    tabBarIcon: ({ color }) => { return <Ionicons name="albums" size={28} color={color} /> },
                }}
            />
            <Tab.Screen name='Explore' component={Explore}
                options={{
                    title: `${t('Explore')}`,
                    tabBarIcon: ({ color }) => { return <MainBookIcon color={color} /> },
                }}
            />
            <Tab.Screen name='Categories' component={Categories}
                options={{
                    title: `${t('Categories')}`,
                    tabBarIcon: ({ color }) => { return <CategoryIcon color={color} /> },
                }}
            />
            <Tab.Screen name='Home' component={Home}
                options={{
                    title: `${t('Home')}`,
                    tabBarIcon: ({ color }) => { return <HomeIcon color={color} /> }
                }}
            />

        </Tab.Navigator >
    )
}

const styles = StyleSheet.create({
    text: {

    }
})