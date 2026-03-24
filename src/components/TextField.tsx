import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ViewStyle, StyleProp, KeyboardTypeOptions, TextInputProps } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export interface TextFieldProps {
    icon?: keyof typeof Ionicons.glyphMap;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    style?: StyleProp<ViewStyle>;
    keyboardType?: KeyboardTypeOptions;
    label?: string;
    autoCapitalize?: TextInputProps['autoCapitalize'];
    multiline?: boolean;
}

const TextField: React.FC<TextFieldProps> = ({
    icon,
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    style,
    keyboardType = 'default',
    label,
    autoCapitalize,
    multiline
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <View style={style}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[
                styles.container,
                isFocused && styles.focusedContainer,
            ]}>
            {icon && (
                <Ionicons
                    name={icon as any}
                    size={20}
                    color={isFocused ? COLORS.primary : COLORS.textLight}
                    style={styles.icon}
                />
            )}
            <TextInput
                style={styles.input}
                placeholder={placeholder || label}
                placeholderTextColor={COLORS.textLight}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry && !isPasswordVisible}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                multiline={multiline}
            />
            {secureTextEntry && (
                <TouchableOpacity
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    style={styles.eyeIcon}
                >
                    <Ionicons
                        name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color={COLORS.textLight}
                    />
                </TouchableOpacity>
            )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 12,
        paddingHorizontal: SPACING.md,
        height: 56,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    focusedContainer: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryLight + '20', // Add some transparency
    },
    icon: {
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.text,
        height: '100%',
    },
    eyeIcon: {
        padding: SPACING.xs,
    },
    label: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: COLORS.text,
        marginBottom: 8,
    },
});

export default TextField;
