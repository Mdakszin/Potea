import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

const Button = ({
    title,
    onPress,
    variant = 'primary', // primary | outline | social
    icon,
    style,
    textStyle
}) => {
    const isOutline = variant === 'outline';
    const isSocial = variant === 'social';

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isOutline && styles.outlineButton,
                isSocial && styles.socialButton,
                style
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {icon && <React.Fragment>{icon}</React.Fragment>}
            <Text
                style={[
                    styles.text,
                    isOutline && styles.outlineText,
                    isSocial && styles.socialText,
                    textStyle,
                    icon && { marginLeft: SPACING.sm }
                ]}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: COLORS.primary,
        height: 58,
        borderRadius: 100, // Fully rounded
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.lg,
        width: '100%',
        ...Platform.select({
            web: {
                boxShadow: `0px 4px 8px ${COLORS.primary}33`, // 33 is 20% opacity in hex
            },
            default: {
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 5,
            }
        }),
    },
    text: {
        ...TYPOGRAPHY.button,
    },
    outlineButton: {
        backgroundColor: COLORS.primaryLight,
    },
    outlineText: {
        ...TYPOGRAPHY.button,
        color: COLORS.primary,
    },
    socialButton: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    socialText: {
        ...TYPOGRAPHY.button,
        color: COLORS.text,
    }
});

export default Button;
