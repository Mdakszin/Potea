import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';

// ─── Light Palette ───
const LIGHT = {
    primary: '#01B763',
    primaryLight: '#E8F8EE',
    background: '#FFFFFF',
    surface: '#FAFAFA',
    text: '#181A20',
    textLight: '#9E9E9E',
    border: '#EEEEEE',
    white: '#FFFFFF',
    black: '#000000',
    error: '#F75555',
    card: '#FAFAFA',
    tabBar: '#FFFFFF',
    inputBg: '#F5F5F5',
};

// ─── Dark Palette ───
const DARK = {
    primary: '#01B763',
    primaryLight: '#1A3D2A',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#F5F5F5',
    textLight: '#9E9E9E',
    border: '#2C2C2C',
    white: '#FFFFFF',
    black: '#000000',
    error: '#FF6B6B',
    card: '#1E1E1E',
    tabBar: '#1A1A1A',
    inputBg: '#2A2A2A',
};

const ThemeContext = createContext({
    isDark: false,
    colors: LIGHT,
    toggleTheme: () => {},
});

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        return {
            isDark: false,
            colors: LIGHT,
            toggleTheme: () => {},
        };
    }
    return context;
}

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => {
        setIsDark(prev => !prev);
    };

    const colors = isDark ? DARK : LIGHT;

    const value = {
        isDark,
        colors,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
