import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import {
    DrawerContentScrollView,
    DrawerItemList,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../store/authSlice';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import * as SecureStore from 'expo-secure-store';

const CustomDrawer = (props) => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);

    const handleLogout = async () => {
        try {
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('user');
            dispatch(logout());
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <DrawerContentScrollView
                {...props}
                contentContainerStyle={styles.drawerContent}
            >
                {/* User Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.profileImageContainer}>
                        {user?.profile_image ? (
                            <Image
                                source={{ uri: user.profile_image }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={styles.profileImagePlaceholder}>
                                <Ionicons name="person" size={40} color={COLORS.white} />
                            </View>
                        )}
                    </View>
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                    <Text style={styles.userRole}>{user?.role || 'Role'}</Text>
                </View>

                {/* Drawer Items */}
                <View style={styles.drawerItems}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>

            {/* Logout Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    drawerContent: {
        paddingTop: 0,
    },
    profileSection: {
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.spacing.xl,
        paddingHorizontal: SIZES.spacing.lg,
        marginBottom: SIZES.spacing.md,
    },
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: SIZES.spacing.md,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    profileImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    userName: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.white,
        textAlign: 'center',
        marginBottom: SIZES.spacing.xs,
    },
    userRole: {
        fontSize: SIZES.sm,
        color: COLORS.white,
        textAlign: 'center',
        opacity: 0.9,
        textTransform: 'capitalize',
    },
    drawerItems: {
        flex: 1,
        paddingTop: SIZES.spacing.sm,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        padding: SIZES.spacing.lg,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SIZES.spacing.md,
        paddingHorizontal: SIZES.spacing.lg,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius.md,
        ...SHADOWS.small,
    },
    logoutText: {
        fontSize: SIZES.md,
        color: COLORS.error,
        marginLeft: SIZES.spacing.md,
        fontWeight: '600',
    },
});

export default CustomDrawer;
