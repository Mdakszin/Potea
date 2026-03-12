import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
    const { currentUser } = useAuth();
    
    // AuthProvider already handles the 'loading' state and delays rendering
    // Once this screen mounts, we know currentUser is determined.
    
    if (currentUser) {
        return <Redirect href="/home" />;
    }
    return <Redirect href="/welcome" />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: COLORS.white,
        justifyContent: 'center', alignItems: 'center',
    },
    loader: { position: 'absolute', bottom: 50 },
});
