import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onChange(!checked)}
            activeOpacity={0.8}
        >
            <View style={[styles.checkbox, checked && styles.checked]}>
                {checked && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
            </View>
            <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.sm,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
    },
    checked: {
        backgroundColor: COLORS.primary,
    },
    label: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.text,
    }
});

export default Checkbox;
