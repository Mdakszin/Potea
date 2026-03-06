import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function SplashScreen({ navigation }) {
    const { currentUser } = useAuth();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentUser) {
                navigation.replace('Main');
            } else {
                navigation.replace('Welcome');
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [currentUser]);

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
