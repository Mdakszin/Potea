import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen({ navigation }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('Welcome');
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Ionicons name="leaf" size={100} color={COLORS.primary} />
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: COLORS.white,
        justifyContent: 'center', alignItems: 'center',
    },
    loader: { position: 'absolute', bottom: 50 },
});
