import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import * as SecureStore from 'expo-secure-store';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';

const LoginScreen = () => {
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        dispatch(loginStart());

        try {
            const response = await api.post(ENDPOINTS.LOGIN, {
                email: email.trim(),
                password,
            });

            if (response.data.success) {
                const { token, user } = response.data;

                // Store token and user data securely
                await SecureStore.setItemAsync('token', token);
                await SecureStore.setItemAsync('user', JSON.stringify(user));

                dispatch(loginSuccess({ token, user }));
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
            dispatch(loginFailure(errorMessage));
            Alert.alert('Login Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[COLORS.gradientStart, COLORS.gradientEnd]}
            style={styles.gradient}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo/Header Section */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="school" size={80} color={COLORS.white} />
                        </View>
                        <Text style={styles.title}>Gyan Education</Text>
                        <Text style={styles.subtitle}>Management System</Text>
                    </View>

                    {/* Login Form */}
                    <View style={styles.formContainer}>
                        <View style={styles.formCard}>
                            <Text style={styles.formTitle}>Welcome Back!</Text>
                            <Text style={styles.formSubtitle}>Sign in to continue</Text>

                            <Input
                                label="Email"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    setErrors({ ...errors, email: '' });
                                }}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                icon="mail-outline"
                                error={errors.email}
                            />

                            <Input
                                label="Password"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    setErrors({ ...errors, password: '' });
                                }}
                                placeholder="Enter your password"
                                secureTextEntry={!showPassword}
                                icon="lock-closed-outline"
                                error={errors.password}
                                rightIcon={
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons
                                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={20}
                                            color={COLORS.textSecondary}
                                        />
                                    </TouchableOpacity>
                                }
                            />

                            <Button
                                title="Sign In"
                                onPress={handleLogin}
                                loading={loading}
                                disabled={loading}
                                size="large"
                                style={styles.loginButton}
                            />

                            {/* Demo Credentials */}
                            <View style={styles.demoSection}>
                                <Text style={styles.demoTitle}>Demo Credentials:</Text>
                                <Text style={styles.demoText}>Email: admin@gyan.edu</Text>
                                <Text style={styles.demoText}>Password: Admin@123</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SIZES.spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: SIZES.spacing.xl,
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.spacing.lg,
        ...SHADOWS.large,
    },
    title: {
        fontSize: SIZES.xxxl,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: SIZES.spacing.xs,
    },
    subtitle: {
        fontSize: SIZES.lg,
        color: COLORS.white,
        opacity: 0.9,
    },
    formContainer: {
        width: '100%',
    },
    formCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius.xl,
        padding: SIZES.spacing.xl,
        ...SHADOWS.large,
    },
    formTitle: {
        fontSize: SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SIZES.spacing.xs,
    },
    formSubtitle: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        marginBottom: SIZES.spacing.xl,
    },
    loginButton: {
        marginTop: SIZES.spacing.md,
    },
    demoSection: {
        marginTop: SIZES.spacing.xl,
        padding: SIZES.spacing.md,
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radius.md,
    },
    demoTitle: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SIZES.spacing.xs,
    },
    demoText: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
});

export default LoginScreen;
