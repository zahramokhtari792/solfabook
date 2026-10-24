import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAppTheme } from '../context/ThemeProvider';
import { useSelector } from 'react-redux';
import { uri } from '../services/URL';

/** A small entry point driven by public admin settings, without exposing user rewards. */
export default function RewardedAdEntry({ compact = false }) {
    const navigation = useNavigation();
    const { colors } = useAppTheme();
    const [info, setInfo] = useState(null);
    const token = useSelector(state => state.auth?.token);

    useFocusEffect(useCallback(() => {
        let alive = true;
        setInfo(null);
        axios.get(`${uri}/rewarded-ads/${token ? 'status' : 'public'}`, {
            headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        })
            .then(({ data }) => { if (alive) setInfo(data); })
            .catch(() => { if (alive) setInfo(null); });
        return () => { alive = false; };
    }, [token]));

    // Do not display an entry/button when the user is in cooldown, has reached
    // the daily cap, has a paid plan, or no advertisement can be watched.
    if (!info?.enabled || !info?.has_available_ad || (token && !info.can_watch)) return null;
    const mins = Number(info.reward_minutes) || 120;
    const duration = mins % 60 === 0 ? `${mins / 60} ساعت` : `${mins} دقیقه`;
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel="مشاهده تبلیغات پاداش‌دار و دریافت اشتراک رایگان"
            onPress={() => navigation.navigate('Subscription')}
            style={[styles.container, compact && styles.compact, {
                backgroundColor: colors.optionSurface || colors.surface,
                borderColor: colors.border || '#E2D5C7',
            }]}
        >
            <View style={[styles.iconBox, { backgroundColor: colors.primary || '#961D5A' }]}>
                <Ionicons name="play" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>تماشای تبلیغ، دریافت {duration} اشتراک رایگان</Text>
                <Text style={[styles.subtitle, { color: colors.text }]}>
                    فعال‌سازی اشتراک بدون پرداخت هزینه
                </Text>
            </View>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: { marginHorizontal: 16, marginVertical: 10, borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth, padding: 14, minHeight: 78,
        flexDirection: 'row', alignItems: 'center', gap: 12 },
    compact: { marginHorizontal: 0 },
    iconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    content: { flex: 1, gap: 4 },
    title: { fontFamily: 'VazirBold', fontSize: 13, textAlign: 'right' },
    subtitle: { fontFamily: 'VazirBold', fontSize: 13, lineHeight: 23, textAlign: 'right' },
});
