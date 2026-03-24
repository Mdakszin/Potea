import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

export default function Index() {
    const { currentUser } = useAuth();
    
    // AuthProvider already handles the 'loading' state and delays rendering
    // Once this screen mounts, we know currentUser is determined.
    
    if (currentUser) {
        return <Redirect href="/(main)/(tabs)/home" />;
    }
    return <Redirect href="/(auth)/welcome" />;
}
