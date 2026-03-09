export const COLORS = {
    primary: '#01B763', // Potea Green
    primaryLight: '#E8F8EE', // Light green background for selected items
    background: '#FFFFFF', // White background
    text: '#181A20', // Main Dark Text
    textLight: '#9E9E9E', // Subtitles and placeholders
    border: '#EEEEEE', // Input borders
    white: '#FFFFFF',
    black: '#000000',
    error: '#F75555',
    card: '#FAFAFA'
};

export const TYPOGRAPHY = {
    h1: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.text,
    },
    h2: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.text,
    },
    body: {
        fontSize: 16,
        fontWeight: '400',
        color: COLORS.text,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400',
        color: COLORS.textLight,
    },
    button: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.white,
    }
};

export const SPACING = {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
};

export const SHADOWS = {
    small: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    medium: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 5.46,
        elevation: 5,
    },
    large: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    }
};
