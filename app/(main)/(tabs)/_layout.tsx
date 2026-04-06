import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../src/constants/theme';
import { useTheme } from '../../../src/contexts/ThemeContext';

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
    home: { active: 'home', inactive: 'home-outline' },
    explore: { active: 'search', inactive: 'search-outline' },
    orders: { active: 'document-text', inactive: 'document-text-outline' },
    wallet: { active: 'wallet', inactive: 'wallet-outline' },
    profile: { active: 'person', inactive: 'person-outline' },
};

export default function TabsLayout() {
    const { isDark, colors } = useTheme();

    return (
        <Tabs
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    ...styles.tabBar,
                    backgroundColor: colors.tabBar,
                    ...Platform.select({
                        web: { boxShadow: isDark ? '0px -5px 20px rgba(0,0,0,0.40)' : '0px -5px 20px rgba(0,0,0,0.10)' } as any,
                        default: { elevation: 20, shadowColor: '#000', shadowOpacity: isDark ? 0.3 : 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: -5 } }
                    }),
                },
                tabBarIcon: ({ focused }) => {
                    const icons = TAB_ICONS[route.name];
                    const iconName = focused ? icons.active : icons.inactive;
                    return (
                        <View style={[styles.iconContainer, focused && { backgroundColor: colors.primaryLight }]}>
                            <Ionicons
                                name={iconName}
                                size={22}
                                color={focused ? COLORS.primary : colors.textLight}
                            />
                        </View>
                    );
                },
            })}
        >
            <Tabs.Screen name="home" />
            <Tabs.Screen name="explore" />
            <Tabs.Screen name="orders" />
            <Tabs.Screen name="wallet" />
            <Tabs.Screen name="profile" />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        height: 70,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderTopWidth: 0,
        paddingTop: 8,
        paddingBottom: 8,
        position: 'absolute',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
