import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const TextField = ({
    icon,
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    style,
    keyboardType = 'default'
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <View style={[
            styles.container,
            isFocused && styles.focusedContainer,
            style
        ]}>
            {icon && (
                <Ionicons
                    name={icon}
                    size={20}
                    color={isFocused ? COLORS.primary : COLORS.textLight}
                    style={styles.icon}
                />
            )}
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textLight}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry && !isPasswordVisible}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                keyboardType={keyboardType}
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
    }
});

export default TextField;
