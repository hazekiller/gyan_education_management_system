import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const Button = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    icon,
    style,
    textStyle,
}) => {
    const getButtonStyle = () => {
        const baseStyle = [styles.button, styles[`button_${size}`]];

        if (variant === 'primary') {
            return [...baseStyle, styles.primaryButton];
        } else if (variant === 'secondary') {
            return [...baseStyle, styles.secondaryButton];
        } else if (variant === 'outline') {
            return [...baseStyle, styles.outlineButton];
        } else if (variant === 'ghost') {
            return [...baseStyle, styles.ghostButton];
        }

        return baseStyle;
    };

    const getTextStyle = () => {
        const baseStyle = [styles.buttonText, styles[`buttonText_${size}`]];

        if (variant === 'outline' || variant === 'ghost') {
            return [...baseStyle, styles.outlineButtonText];
        }

        return baseStyle;
    };

    if (variant === 'primary' && !disabled) {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                activeOpacity={0.8}
                style={[style, { opacity: disabled ? 0.5 : 1 }]}
            >
                <LinearGradient
                    colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[...getButtonStyle(), SHADOWS.medium]}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <>
                            {icon}
                            <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
                        </>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            style={[...getButtonStyle(), style, { opacity: disabled ? 0.5 : 1 }]}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white} />
            ) : (
                <>
                    {icon}
                    <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: SIZES.radius.md,
        gap: SIZES.spacing.sm,
    },
    button_small: {
        paddingVertical: SIZES.spacing.sm,
        paddingHorizontal: SIZES.spacing.md,
    },
    button_medium: {
        paddingVertical: SIZES.spacing.md,
        paddingHorizontal: SIZES.spacing.lg,
    },
    button_large: {
        paddingVertical: SIZES.spacing.lg,
        paddingHorizontal: SIZES.spacing.xl,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
    },
    secondaryButton: {
        backgroundColor: COLORS.secondary,
    },
    outlineButton: {
        backgroundColor: COLORS.transparent,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    ghostButton: {
        backgroundColor: COLORS.transparent,
    },
    buttonText: {
        fontWeight: '600',
        color: COLORS.white,
    },
    buttonText_small: {
        fontSize: SIZES.sm,
    },
    buttonText_medium: {
        fontSize: SIZES.md,
    },
    buttonText_large: {
        fontSize: SIZES.lg,
    },
    outlineButtonText: {
        color: COLORS.primary,
    },
});

export default Button;
