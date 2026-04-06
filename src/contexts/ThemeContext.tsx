import React, { createContext, useState, useContext, ReactNode } from 'react';

// ─── Theme Type Definition ───
export interface ThemeColors {
    primary: string;
    primaryLight: string;
    background: string;
    surface: string;
    text: string;
    textLight: string;
    border: string;
    white: string;
    black: string;
    error: string;
    card: string;
    tabBar: string;
    inputBg: string;
}

// ─── Light Palette ───
const LIGHT: ThemeColors = {
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
const DARK: ThemeColors = {
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

interface ThemeContextType {
    isDark: boolean;
    colors: ThemeColors;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
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

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => {
        setIsDark(prev => !prev);
    };

    const colors = isDark ? DARK : LIGHT;

    const value: ThemeContextType = {
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
