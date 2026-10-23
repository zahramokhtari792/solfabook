import { useMemo } from 'react';
import { StyleSheet, Platform, Dimensions } from 'react-native';
import { themeColor0, themeColor1, themeColor3, themeColor4, themePalettes } from '../theme/Color';
import { useAppTheme } from '../context/ThemeProvider';

export const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
export const { width: deviceWidthScreen, height: deviceHeightScreen } = Dimensions.get('screen');
export const CELL_SIZE = 45;
export const CELL_BORDER_RADIUS = Platform.OS === 'ios' ? 8 : 0;
export const DEFAULT_CELL_BG_COLOR = themeColor1.bgColor(1);
export const NOT_EMPTY_CELL_BG_COLOR = themeColor0.bgColor(1);
export const ACTIVE_CELL_BG_COLOR = themeColor1.bgColor(1);

export const gradientColors = [
    themeColor0.bgColor(1),
    themeColor0.bgColor(0.7),
    themeColor0.bgColor(0.5),
    themeColor0.bgColor(0.2),
    themeColor1.bgColor(0.2),
    themeColor1.bgColor(0.5),
    themeColor1.bgColor(0.8),
    themeColor1.bgColor(1)
]

const RTL_LANGS = new Set(['fa', 'ar', 'he', 'ur', 'ps', 'ckb']);

export const langIsRTL = (lang) => {
    const code = (lang || '').toLowerCase().split('-')[0];
    return RTL_LANGS.has(code);
};
// Pure factory: the historical one-argument call continues to use the original Light colors.
export const makeStyles = (lang = 'fa', colors = themePalettes.light) => {
    const isRTL = langIsRTL(lang);

    return StyleSheet.create({
        textStyle: {
            fontSize: 14,
            fontFamily: isRTL ? 'VazirBold' : 'VazirThin',
            textAlign: isRTL ? 'right' : 'left',
            color: colors.primaryText,
            paddingRight: 10,
        },
        inputSearchStyle: {
            fontSize: 14,
            fontFamily: isRTL ? 'VazirBold' : 'VazirThin',
            textAlign: isRTL ? 'right' : 'left',
            color: colors.primaryText,
            paddingHorizontal: 10,
            height: 50,
            borderWidth: 0,
            // backgroundColor: themeColor4.bgColor(0.1),
            borderRadius: 8,
        },
        itemContainerStyle: {
            backgroundColor: themeColor4.bgColor(0.1),
            borderRadius: 8,
            margin: 2,
            borderCurve: 'continuous',
            // overflow: 'hidden',
        },
        dropDownContainerStyle: {
            borderRadius: 8,
            margin: 0,
            padding: 0,
            borderCurve: 'continuous',
            // overflow: 'hidden',
            borderColor: colors.background,
            backgroundColor: colors.background
        },
        codeFieldRoot: {
            height: 45,
            paddingHorizontal: 20,
            justifyContent: 'center',
        },

        cell: {
            marginHorizontal: 8,
            height: 45,
            width: 45,
            lineHeight: 45 - 5,
            borderBottomColor: colors.primary,
            borderBottomWidth: StyleSheet.hairlineWidth,
            ...Platform.select({ web: { lineHeight: 65 } }),
            fontSize: 24,
            textAlign: 'center',
            borderRadius: 8,
            borderCurve: 'continuous',
            overflow: 'hidden',
            color: colors.primaryText,
            // Preserve the historical '#fff' output exactly in Light.
            backgroundColor: colors === themePalettes.light ? '#fff' : colors.inputBackground,
        },

        container: {
            flex: 1,
            backgroundColor: colors.background,
        },

        center: {
            alignItems: 'center',
            justifyContent: 'center'
        },

        rowWrapper: {
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },

        row: {
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center'
        },

        spacing: {
            paddingVertical: '5%',
            paddingHorizontal: '5%',
        },

        shadow: {
            shadowColor: colors.shadow,
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.22,
            shadowRadius: 2.22,
            elevation: 3,
        },

        border5: {
            borderRadius: 5,
            borderCurve: "continuous",
        },

        border10: {
            borderRadius: 10,
            borderCurve: "continuous",
        },
        border8: {
            borderRadius: 8,
            borderCurve: "continuous"
        },

        border100: {
            borderRadius: 100,
            borderCurve: "continuous",
        },

        text: {
            fontFamily: isRTL ? 'VazirBold' : 'VazirThin',
            fontSize: 14,
            color: colors.primaryText,
            textAlign: isRTL ? 'right' : 'left',
        },

        text1: {
            fontFamily: isRTL ? 'VazirBold' : 'VazirThin',
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: isRTL ? 'right' : 'left',
        },

        text3: {
            fontFamily: isRTL ? 'VazirBold' : 'VazirThin',
            fontSize: 14,
            color: colors.textMuted,
            textAlign: isRTL ? 'right' : 'left',
        },

        text4: {
            fontFamily: isRTL ? 'VazirBold' : 'VazirThin',
            fontSize: 14,
            color: colors.onPrimary,
            textAlign: isRTL ? 'right' : 'left',
        },

        text6: {
            fontFamily: isRTL ? 'VazirBold' : 'VazirThin',
            fontSize: 14,
            color: colors.danger,
            textAlign: isRTL ? 'right' : 'left',
        },

        text7: {
            fontFamily: isRTL ? 'VazirBold' : 'VazirThin',
            fontSize: 14,
            color: colors.success,
            textAlign: isRTL ? 'right' : 'left',
        },

        text10: {
            fontFamily: isRTL ? 'VazirBold' : 'VazirThin',
            fontSize: 14,
            color: colors.text,
            textAlign: isRTL ? 'right' : 'left',
        },

        title: {
            fontSize: deviceWidth >= 768 ? 24 : 16,
            fontFamily: isRTL ? 'VazirBold' : 'VazirThin',
            color: colors.primaryText,
            textAlign: isRTL ? 'right' : 'left',
        },

        title1: {
            fontSize: deviceWidth >= 768 ? 24 : 16,
            fontFamily: isRTL ? 'VazirBold' : 'VazirThin',
            color: colors.textSecondary,
            textAlign: isRTL ? 'right' : 'left',
        },

        title3: {
            fontSize: deviceWidth >= 768 ? 24 : 16,
            fontFamily: isRTL ? 'VazirBold' : 'VazirThin',
            color: colors.textMuted,
            textAlign: isRTL ? 'right' : 'left',
        },

        title4: {
            fontSize: deviceWidth >= 768 ? 24 : 16,
            fontFamily: isRTL ? 'VazirBold' : 'VazirThin',
            color: colors.onPrimary,
            textAlign: isRTL ? 'right' : 'left',
        },

        title6: {
            fontSize: deviceWidth >= 768 ? 24 : 16,
            fontFamily: isRTL ? 'VazirBold' : 'VazirThin',
            color: colors.danger,
            textAlign: isRTL ? 'right' : 'left',
        },

        title10: {
            fontSize: deviceWidth >= 768 ? 24 : 16,
            fontFamily: isRTL ? 'VazirBold' : 'VazirThin',
            color: colors.text,
            textAlign: isRTL ? 'right' : 'left',
        },

        heading: {
            fontSize: 20,
            fontFamily: isRTL ? 'VazirBold' : 'VazirThin',
            color: colors.primaryText,
            textAlign: isRTL ? 'right' : 'left',
        },

        heading4: {
            fontSize: 20,
            fontFamily: isRTL ? 'VazirBold' : 'VazirThin',
            color: colors.onPrimary,
            textAlign: isRTL ? 'right' : 'left',
        },

        heading10: {
            fontSize: 20,
            fontFamily: isRTL ? 'VazirBold' : 'VazirThin',
            color: colors.text,
            textAlign: isRTL ? 'right' : 'left',
        },

        discountText: {
            fontFamily: isRTL ? 'VazirBold' : 'VazirThin',
            color: colors.text,
            textDecorationLine: 'line-through',
            textAlign: isRTL ? 'right' : 'left',
        },

        textInput: {
            minHeight: 50,
            backgroundColor: colors.surface,
            paddingHorizontal: '5%',
        },

        seperator: {
            paddingBottom: '5%',
            paddingHorizontal: '5%',
            gap: 20,
            borderBottomWidth: 5,
            borderBottomColor: colors.border,
        },

        nav: {
            gap: 50,
            paddingHorizontal: '5%',
            backgroundColor: colors.surface
        },

        whiteButton: {
            backgroundColor: colors.surface,
            borderRadius: 100,
            margin: 5,
            padding: 10,
        },

        add: {
            padding: 3,
            backgroundColor: colors.primary,
            borderRadius: 100,
            alignItems: 'center',
            justifyContent: 'center'
        },

        remove: {
            padding: 3,
            borderRadius: 100,
            borderColor: colors.primary,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center'
        },

        banner: {
            height: 140,
            width: '95%',
        },

        strip: {
            minHeight: 50,
            width: '100%',
            marginVertical: 10,
            backgroundColor: themeColor0.bgColor(0.5),
        },
        noZoomInput: {
            fontSize: 16,
            lineHeight: 20, 
        },
    });
};
// Consume the active colors from ThemeProvider and recompute only when lang/theme changes.
// Call this hook from React components rendered inside ThemeProvider.
export const useNewStyles = (lang = 'fa') => {
    const { colors } = useAppTheme();
    return useMemo(() => makeStyles(lang, colors), [lang, colors]);
};

export default makeStyles;
// Backwards-compatible static Light styles for legacy imports. Not theme-reactive.
export const DefaultStyles = makeStyles('fa');