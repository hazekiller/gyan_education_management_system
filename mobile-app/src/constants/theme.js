export const COLORS = {
    // Primary Colors
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    primaryLight: '#818cf8',

    // Secondary Colors
    secondary: '#8b5cf6',
    secondaryDark: '#7c3aed',
    secondaryLight: '#a78bfa',

    // Accent Colors
    accent: '#ec4899',
    accentDark: '#db2777',
    accentLight: '#f472b6',

    // Neutral Colors
    background: '#f8fafc',
    surface: '#ffffff',
    card: '#ffffff',

    // Text Colors
    text: '#1e293b',
    textSecondary: '#64748b',
    textLight: '#94a3b8',

    // Status Colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // Border Colors
    border: '#e2e8f0',
    borderLight: '#f1f5f9',

    // Other
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',

    // Gradients
    gradientStart: '#6366f1',
    gradientEnd: '#8b5cf6',
};

export const SIZES = {
    // Font Sizes
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,

    // Spacing
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },

    // Border Radius
    radius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
    },

    // Icon Sizes
    icon: {
        sm: 16,
        md: 20,
        lg: 24,
        xl: 32,
    },
};

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    semibold: 'System',
};

export const SHADOWS = {
    small: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
};

export default {
    COLORS,
    SIZES,
    FONTS,
    SHADOWS,
};
