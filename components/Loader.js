import { View, Text, StyleSheet } from 'react-native';
import { useRef } from 'react';

import NewStyles from '../styles/NewStyles';
import LottieView from 'lottie-react-native';
import { themeColor0 } from '../theme/Color';

export default function Loader() {

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
                        keypath: "newScene",
                        color: themeColor0.bgColor(1),
                    }
                ]}
                source={require('../assets/svg/loader.json')}
            />
          
        </View>
    )
}



const styles = StyleSheet.create({
    animationContainer: {
        flex: 1,
    },
});