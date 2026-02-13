import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
                <LinearGradient
                    colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                    style={styles.profileSection}
                >
                    <View style={styles.profileImageContainer}>
                        {user?.profile_image ? (
                            <Image
                                source={{ uri: user.profile_image }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={styles.profileImagePlaceholder}>
                                <Ionicons name="person" size={35} color={COLORS.white} />
                            </View>
                        )}
                    </View>
                    <Text style={styles.userName}>{user?.name || 'Gyan User'}</Text>
                    <Text style={styles.userRole}>{user?.role || 'Guest'}</Text>
                </LinearGradient>

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
        paddingTop: 60,
        paddingBottom: SIZES.spacing.xl,
        paddingHorizontal: SIZES.spacing.lg,
        borderBottomLeftRadius: SIZES.radius.xl,
        borderBottomRightRadius: SIZES.radius.xl,
        marginBottom: SIZES.spacing.md,
        ...SHADOWS.medium,
    },
    profileImageContainer: {
        alignItems: 'flex-start',
        marginBottom: SIZES.spacing.md,
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    profileImagePlaceholder: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    userName: {
        fontSize: SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.white,
        textAlign: 'left',
        marginBottom: SIZES.spacing.xs,
    },
    userRole: {
        fontSize: SIZES.sm,
        color: COLORS.white,
        textAlign: 'left',
        opacity: 0.9,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
    },
    drawerItems: {
        flex: 1,
        paddingTop: SIZES.spacing.sm,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        padding: SIZES.spacing.lg,
        backgroundColor: COLORS.white,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SIZES.spacing.md,
        paddingHorizontal: SIZES.spacing.lg,
        backgroundColor: COLORS.error + '10', // 10% opacity
        borderRadius: SIZES.radius.md,
    },
    logoutText: {
        fontSize: SIZES.md,
        color: COLORS.error,
        marginLeft: SIZES.spacing.md,
        fontWeight: 'bold',
    },
});

export default CustomDrawer;
