import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    size?: number;
    activeColor?: string;
    inactiveColor?: string;
    readonly?: boolean;
}

export default function StarRating({
    rating,
    onRatingChange,
    size = 20,
    activeColor = '#FFD700',
    inactiveColor = '#E0E0E0',
    readonly = false
}: StarRatingProps) {
    const stars = [1, 2, 3, 4, 5];

    return (
        <View style={styles.container}>
            {stars.map((star) => (
                <TouchableOpacity
                    key={star}
                    activeOpacity={0.7}
                    disabled={readonly}
                    onPress={() => onRatingChange && onRatingChange(star)}
                    style={styles.starButton}
                >
                    <Ionicons
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={size}
                        color={star <= rating ? activeColor : inactiveColor}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starButton: {
        padding: 2,
    },
});
