import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, StyleProp, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'outline' | 'social';
    icon?: ReactNode;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    disabled?: boolean;
    loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    icon,
    style,
    textStyle,
    disabled,
    loading
}) => {
    const isOutline = variant === 'outline';
    const isSocial = variant === 'social';

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isOutline && styles.outlineButton,
                isSocial && styles.socialButton,
                disabled && styles.disabledButton,
                style
            ]}
            onPress={onPress}
            activeOpacity={0.8}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color={isOutline || isSocial ? COLORS.primary : COLORS.white} />
            ) : (
                <>
                    {icon && <React.Fragment>{icon}</React.Fragment>}
                    <Text
                        style={[
                            styles.text,
                            isOutline && styles.outlineText,
                            isSocial && styles.socialText,
                            textStyle,
                            icon ? { marginLeft: SPACING.sm } : undefined
                        ]}
                    >
                        {title}
                    </Text>
                </>
            )}
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
        ...SHADOWS.small,
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
    },
    disabledButton: {
        opacity: 0.6,
    }
});

export default Button;
