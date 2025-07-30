import { StyleSheet, Platform, Dimensions } from 'react-native';
import { themeColor0, themeColor1, themeColor2, themeColor3, themeColor4, themeColor5, themeColor6, themeColor7, themeColor8, themeColor9, themeColor10, themeColor11, themeColor12 } from '../theme/Color';

export const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
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

const NewStyles = StyleSheet.create({
    textStyle: {
        fontSize: 14,
        fontFamily: 'iransans',
        textAlign: 'right',
        color: themeColor0.bgColor(1),
        paddingRight: 10,
    },
    inputSearchStyle: {
        fontSize: 14,
        fontFamily: 'iransans',
        textAlign: 'right',
        color: themeColor0.bgColor(1),
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
        borderColor: themeColor5.bgColor(1),
        backgroundColor: themeColor5.bgColor(1)
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
        borderBottomColor: themeColor0.bgColor(1),
        borderBottomWidth: StyleSheet.hairlineWidth,
        ...Platform.select({ web: { lineHeight: 65 } }),
        fontSize: 24,
        textAlign: 'center',
        borderRadius: 8,
        borderCurve: 'continuous',
        overflow: 'hidden',
        color: themeColor0.bgColor(1),
        backgroundColor: '#fff',
    },

    container: {
        flex: 1,
        backgroundColor: themeColor5.bgColor(1),
    },

    center: {
        alignItems: 'center',
        justifyContent: 'center'
    },

    rowWrapper: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    row: {
        flexDirection: 'row-reverse',
        alignItems: 'center'
    },

    spacing: {
        paddingVertical: '5%',
        paddingHorizontal: '5%',
    },

    shadow: {
        shadowColor: themeColor10.bgColor(1),
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
        overflow: "hidden",
    },

    border10: {
        borderRadius: 10,
        borderCurve: "continuous",
        overflow: "hidden",
    },

    border100: {
        borderRadius: 100,
        borderCurve: "continuous",
        overflow: "hidden",
    },

    text: {
        fontFamily: 'iransans',
        fontSize: 12,
        color: themeColor0.bgColor(1),
        textAlign: 'right',
    },

    text1: {
        fontFamily: 'iransans',
        fontSize: 12,
        color: themeColor1.bgColor(1),
        textAlign: 'right',
    },

    text3: {
        fontFamily: 'iransans',
        fontSize: 12,
        color: themeColor3.bgColor(1),
        textAlign: 'right',
    },

    text4: {
        fontFamily: 'iransans',
        fontSize: 12,
        color: themeColor4.bgColor(1),
        textAlign: 'right',
    },

    text6: {
        fontFamily: 'iransans',
        fontSize: 12,
        color: themeColor6.bgColor(1),
        textAlign: 'right',
    },

    text7: {
        fontFamily: 'iransans',
        fontSize: 12,
        color: themeColor7.bgColor(1),
        textAlign: 'right',
    },

    text10: {
        fontFamily: 'iransans',
        fontSize: 12,
        color: themeColor10.bgColor(1),
        textAlign: 'right',
    },

    title: {
        fontSize: 14,
        fontFamily: 'iransans',
        color: themeColor0.bgColor(1),
        textAlign: 'right',
    },

    title1: {
        fontSize: 14,
        fontFamily: 'iransans',
        color: themeColor1.bgColor(1),
        textAlign: 'right',
    },

    title3: {
        fontSize: 14,
        fontFamily: 'iransans',
        color: themeColor3.bgColor(1),
        textAlign: 'right',
    },

    title4: {
        fontSize: 14,
        fontFamily: 'iransans',
        color: themeColor4.bgColor(1),
        textAlign: 'right',
    },

    title6: {
        fontSize: 14,
        fontFamily: 'iransans',
        color: themeColor6.bgColor(1),
        textAlign: 'right',
    },

    title10: {
        fontSize: 14,
        fontFamily: 'iransans',
        color: themeColor10.bgColor(1),
        textAlign: 'right',
    },

    heading: {
        fontSize: 20,
        fontFamily: 'iransans',
        color: themeColor0.bgColor(1),
        textAlign: 'right',
    },

    heading4: {
        fontSize: 20,
        fontFamily: 'iransans',
        color: themeColor4.bgColor(1),
        textAlign: 'right',
    },

    heading10: {
        fontSize: 20,
        fontFamily: 'iransans',
        color: themeColor10.bgColor(1),
        textAlign: 'right',
    },

    discountText: {
        fontFamily: 'iransans',
        color: themeColor10.bgColor(1),
        textDecorationLine: 'line-through',
        textAlign: 'right',
    },

    textInput: {
        minHeight: 50,
        backgroundColor: themeColor3.bgColor(0.2),
        paddingHorizontal: '5%',
    },

    seperator: {
        paddingBottom: '5%',
        paddingHorizontal: '5%',
        gap: 20,
        borderBottomWidth: 5,
        borderBottomColor: themeColor3.bgColor(0.2),
    },

    nav: {
        gap: 50,
        paddingHorizontal: '5%',
        backgroundColor: themeColor4.bgColor(1)
    },

    whiteButton: {
        backgroundColor: themeColor4.bgColor(1),
        borderRadius: 100,
        margin: 5,
        padding: 10,
    },

    add: {
        padding: 3,
        backgroundColor: themeColor0.bgColor(1),
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center'
    },

    remove: {
        padding: 3,
        borderRadius: 100,
        borderColor: themeColor0.bgColor(1),
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
});

export default NewStyles;