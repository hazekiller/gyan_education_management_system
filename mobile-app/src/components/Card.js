import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const Card = ({
    children,
    title,
    subtitle,
    onPress,
    style,
    headerStyle,
    contentStyle,
    footer,
}) => {
    const CardContent = (
        <View style={[styles.card, style]}>
            {(title || subtitle) && (
                <View style={[styles.header, headerStyle]}>
                    {title && <Text style={styles.title}>{title}</Text>}
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
            )}
            <View style={[styles.content, contentStyle]}>
                {children}
            </View>
            {footer && <View style={styles.footer}>{footer}</View>}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                {CardContent}
            </TouchableOpacity>
        );
    }

    return CardContent;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius.lg,
        ...SHADOWS.medium,
        marginBottom: SIZES.spacing.md,
        overflow: 'hidden',
    },
    header: {
        padding: SIZES.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    title: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SIZES.spacing.xs,
    },
    subtitle: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    content: {
        padding: SIZES.spacing.lg,
    },
    footer: {
        padding: SIZES.spacing.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
});

export default Card;
