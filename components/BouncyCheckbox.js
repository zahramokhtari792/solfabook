
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import makeStyles from '../styles/NewStyles';


const BouncyCheckbox = (
    (
        {
            size = 25,
            fillColor = '#3366BB',
            unFillColor = '#FFFFFF',
            iconStyle,
            innerIconStyle,
            textStyle,
            text,
            isChecked = false,
            onPress,
            disabled = false,
        },
        ref
    ) => {
        const isCheckedValue =
            typeof isChecked === 'function' ? isChecked() : isChecked;

        const handlePress = () => {
            if (disabled) return;
            onPress?.();
        };
        const { i18n } = useTranslation();
        const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

        const NewStyles = useMemo(() => makeStyles(lang), [lang]);
        return (
            <Pressable
                ref={ref}
                onPress={handlePress}
                disabled={disabled}
                style={[NewStyles.row, { gap: 8 }]}
            >
                <View
                    style={[
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 4,
                            borderWidth: 2,
                            borderColor: isCheckedValue ? fillColor : unFillColor,
                            backgroundColor: isCheckedValue ? fillColor : unFillColor,
                            justifyContent: 'center',
                            alignItems: 'center',
                        },
                        iconStyle,
                    ]}
                >
                    <View
                        style={[
                            {
                                justifyContent: 'center',
                                alignItems: 'center',
                            },
                        ]}
                    >
                        {isCheckedValue && (
                            <Ionicons
                                name="checkmark"
                                size={size * 0.6}
                                color={unFillColor}
                            />
                        )}
                    </View>
                </View>
                {text && <Text style={textStyle}>{text}</Text>}
            </Pressable>
        );
    }
);


export default BouncyCheckbox;
