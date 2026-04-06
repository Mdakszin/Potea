import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { COLORS } from '../src/constants/theme';

export default function Index() {
    const { currentUser, loading } = useAuth();
    
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }
    
    if (currentUser) {
        return <Redirect href="/(main)/(tabs)/home" />;
    }
    return <Redirect href="/(auth)/welcome" />;
}
