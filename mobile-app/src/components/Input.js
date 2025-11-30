import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType = 'default',
    autoCapitalize = 'none',
    error,
    icon,
    rightIcon,
    multiline = false,
    numberOfLines = 1,
    editable = true,
    style,
    containerStyle,
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.inputContainer, error && styles.inputError]}>
                {icon && (
                    <View style={styles.iconContainer}>
                        <Ionicons name={icon} size={20} color={COLORS.textSecondary} />
                    </View>
                )}
                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.multilineInput,
                        icon && styles.inputWithIcon,
                        style,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textLight}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    editable={editable}
                />
                {rightIcon && (
                    <View style={styles.rightIconContainer}>
                        {rightIcon}
                    </View>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SIZES.spacing.md,
    },
    label: {
        fontSize: SIZES.base,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SIZES.spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    inputError: {
        borderColor: COLORS.error,
    },
    iconContainer: {
        paddingLeft: SIZES.spacing.md,
    },
    input: {
        flex: 1,
        paddingVertical: SIZES.spacing.md,
        paddingHorizontal: SIZES.spacing.md,
        fontSize: SIZES.md,
        color: COLORS.text,
    },
    inputWithIcon: {
        paddingLeft: SIZES.spacing.sm,
    },
    multilineInput: {
        paddingTop: SIZES.spacing.md,
        textAlignVertical: 'top',
    },
    rightIconContainer: {
        paddingRight: SIZES.spacing.md,
    },
    errorText: {
        fontSize: SIZES.sm,
        color: COLORS.error,
        marginTop: SIZES.spacing.xs,
        marginLeft: SIZES.spacing.xs,
    },
});

export default Input;
