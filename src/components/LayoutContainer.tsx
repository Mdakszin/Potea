import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useResponsive } from '../utils/responsive';

interface LayoutContainerProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export default function LayoutContainer({ children, style }: LayoutContainerProps) {
    const { contentMaxWidth, isWeb } = useResponsive();

    return (
        <View style={[styles.outerContainer, isWeb && styles.webOuter]}>
            <View style={[styles.innerContainer, { maxWidth: contentMaxWidth }, style]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        width: '100%',
    },
    webOuter: {
        alignItems: 'center',
    },
    innerContainer: {
        width: '100%',
        flex: 1,
    },
});
