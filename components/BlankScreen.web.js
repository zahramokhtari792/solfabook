import { View, Text, StyleSheet, Platform } from 'react-native';
import { useMemo, useRef } from 'react';
import makeStyles from '../styles/NewStyles'; 
import { themeColor0 } from '../theme/Color';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

export default function BlankScreen() {

    const animation = useRef();
    const { t } = useTranslation()
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useMemo(() => makeStyles(lang), [lang]);
    return (
        <View style={[styles.animationContainer, NewStyles.center]}>
           
            <View style={[styles.buttonContainer, { alignItems: 'center' }]}>
                <Text style={NewStyles.text10}>{t("There are no results to display.")}</Text>
                {lang == 'fa' && <Text style={[NewStyles.text3, { textAlign: 'center' }]}>
                    چون  نیست  ز  هرچه  هست  جز  باد  به  دست
                    {'\n'}
                    چون هست  به هرچه هست  نقصان  و  شکست
                    {'\n'}
                    انگار    که    هرچه    هست    در   عالم     نیست
                    {'\n'}
                    پندار    که     هرچه    نیست    در   عالم    هست
                    {'\n'}{'\n'}
                    حکیم عمر خیام
                </Text>}
            </View>
        </View>
    )
}



const styles = StyleSheet.create({
    animationContainer: {
        flex: 1,
    },
});