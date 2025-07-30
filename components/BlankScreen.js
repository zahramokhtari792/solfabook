import { View, Text, StyleSheet } from 'react-native';
import { useRef } from 'react';

import NewStyles from '../styles/NewStyles';
import LottieView from 'lottie-react-native';
import { themeColor0 } from '../theme/Color';

export default function BlankScreen() {

    const animation = useRef();

    return (
        <View style={[styles.animationContainer, NewStyles.center]}>
            <LottieView
                autoPlay
                loop
                ref={animation}
                style={{
                    width: 100,
                    height: 100,
                }}
                colorFilters={[
                    
                    {
                        keypath: "line 1 Outlines",
                        color: themeColor0.bgColor(1),
                    },
                    {
                        keypath: "line 2 Outlines",
                        color: themeColor0.bgColor(1),
                    },
                    {
                        keypath: "line 3 Outlines",
                        color: themeColor0.bgColor(1),
                    },
                    {
                        keypath: "line 4 Outlines",
                        color: themeColor0.bgColor(1),
                    },
                    {
                        keypath: "circulito Outlines",
                        color: themeColor0.bgColor(1),
                    },
                    {
                        keypath: "x 2 Outlines",
                        color: themeColor0.bgColor(1),
                    },
                    {
                        keypath: "bg Outlines",
                        color: themeColor0.bgColor(0.3),
                    }
                ]}
                source={require('../assets/svg/blank.json')}
            />
            <View style={[styles.buttonContainer, { alignItems: 'center' }]}>
                <Text style={NewStyles.text10}>نتیجه‌ای برای نمایش وجود ندارد.</Text>
                <Text style={[NewStyles.text3, { textAlign: 'center' }]}>
                    چون  نیست  ز  هرچه  هست  جز  باد  به  دست
                    {'\n'}
                    چون هست  به هرچه هست  نقصان  و  شکست
                    {'\n'}
                    انگار    که    هرچه    هست    در   عالم     نیست
                    {'\n'}
                    پندار    که     هرچه    نیست    در   عالم    هست
                    {'\n'}{'\n'}
                    حکیم عمر خیام
                </Text>
            </View>
        </View>
    )
}



const styles = StyleSheet.create({
    animationContainer: {
        flex: 1,
    },
});