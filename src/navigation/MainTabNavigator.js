import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import EWalletScreen from '../screens/EWalletScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
    Home: { active: 'home', inactive: 'home-outline' },
    Explore: { active: 'search', inactive: 'search-outline' },
    Orders: { active: 'document-text', inactive: 'document-text-outline' },
    Wallet: { active: 'wallet', inactive: 'wallet-outline' },
    Profile: { active: 'person', inactive: 'person-outline' },
};

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: styles.tabBar,
                tabBarIcon: ({ focused, size }) => {
                    const icons = TAB_ICONS[route.name];
                    const iconName = focused ? icons.active : icons.inactive;
                    return (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Ionicons
                                name={iconName}
                                size={22}
                                color={focused ? COLORS.primary : COLORS.textLight}
                            />
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Explore" component={ExploreScreen} />
            <Tab.Screen name="Orders" component={MyOrdersScreen} />
            <Tab.Screen name="Wallet" component={EWalletScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        height: 70,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderTopWidth: 0,
        backgroundColor: COLORS.white,
        elevation: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: -5 },
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
    iconContainerActive: {
        backgroundColor: COLORS.primaryLight,
    },
});
