import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/authSlice';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const DashboardScreen = ({ navigation }) => {
    const user = useSelector(selectUser);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        classes: 0,
        attendance: 0,
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch dashboard statistics
            const response = await api.get('/dashboard/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    const StatCard = ({ title, value, icon, color, onPress }) => (
        <TouchableOpacity
            style={styles.statCard}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={32} color={color} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
        </TouchableOpacity>
    );

    const QuickActionCard = ({ title, icon, color, onPress }) => (
        <TouchableOpacity
            style={styles.quickActionCard}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={styles.quickActionTitle}>{title}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userName}>{user?.name || 'User'}!</Text>
                <Text style={styles.userRole}>{user?.role || 'Role'}</Text>
            </View>

            {/* Statistics Cards */}
            <View style={styles.statsContainer}>
                <StatCard
                    title="Students"
                    value={stats.students || 0}
                    icon="people"
                    color={COLORS.primary}
                    onPress={() => navigation.navigate('Students')}
                />
                <StatCard
                    title="Teachers"
                    value={stats.teachers || 0}
                    icon="person"
                    color={COLORS.secondary}
                    onPress={() => navigation.navigate('Teachers')}
                />
                <StatCard
                    title="Classes"
                    value={stats.classes || 0}
                    icon="school"
                    color={COLORS.success}
                    onPress={() => navigation.navigate('Classes')}
                />
                <StatCard
                    title="Attendance"
                    value={`${stats.attendance || 0}%`}
                    icon="checkmark-circle"
                    color={COLORS.warning}
                    onPress={() => navigation.navigate('Attendance')}
                />
            </View>

            {/* Quick Actions */}
            <Card title="Quick Actions" style={styles.quickActionsCard}>
                <View style={styles.quickActionsGrid}>
                    <QuickActionCard
                        title="Mark Attendance"
                        icon="checkmark-done"
                        color={COLORS.success}
                        onPress={() => navigation.navigate('Attendance')}
                    />
                    <QuickActionCard
                        title="Exams"
                        icon="document-text"
                        color={COLORS.primary}
                        onPress={() => navigation.navigate('Exams')}
                    />
                    <QuickActionCard
                        title="Assignments"
                        icon="clipboard"
                        color={COLORS.secondary}
                        onPress={() => navigation.navigate('Assignments')}
                    />
                    <QuickActionCard
                        title="Events"
                        icon="calendar"
                        color={COLORS.accent}
                        onPress={() => navigation.navigate('Events')}
                    />
                    <QuickActionCard
                        title="Messages"
                        icon="chatbubbles"
                        color={COLORS.info}
                        onPress={() => navigation.navigate('Messages')}
                    />
                    <QuickActionCard
                        title="Library"
                        icon="library"
                        color={COLORS.warning}
                        onPress={() => navigation.navigate('Library')}
                    />
                </View>
            </Card>

            {/* Recent Activity */}
            <Card title="Recent Activity" style={styles.activityCard}>
                <View style={styles.activityItem}>
                    <Ionicons name="notifications" size={20} color={COLORS.primary} />
                    <Text style={styles.activityText}>New announcement posted</Text>
                </View>
                <View style={styles.activityItem}>
                    <Ionicons name="calendar" size={20} color={COLORS.success} />
                    <Text style={styles.activityText}>Upcoming event tomorrow</Text>
                </View>
                <View style={styles.activityItem}>
                    <Ionicons name="document" size={20} color={COLORS.warning} />
                    <Text style={styles.activityText}>Assignment deadline approaching</Text>
                </View>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: SIZES.spacing.lg,
    },
    welcomeSection: {
        marginBottom: SIZES.spacing.xl,
    },
    welcomeText: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
    },
    userName: {
        fontSize: SIZES.xxxl,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: SIZES.spacing.xs,
    },
    userRole: {
        fontSize: SIZES.md,
        color: COLORS.primary,
        textTransform: 'capitalize',
        marginTop: SIZES.spacing.xs,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: SIZES.spacing.lg,
    },
    statCard: {
        width: '48%',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius.lg,
        padding: SIZES.spacing.lg,
        marginBottom: SIZES.spacing.md,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    statIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.spacing.md,
    },
    statValue: {
        fontSize: SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SIZES.spacing.xs,
    },
    statTitle: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    quickActionsCard: {
        marginBottom: SIZES.spacing.lg,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionCard: {
        width: '48%',
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radius.md,
        padding: SIZES.spacing.md,
        marginBottom: SIZES.spacing.md,
        alignItems: 'center',
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.spacing.sm,
    },
    quickActionTitle: {
        fontSize: SIZES.sm,
        color: COLORS.text,
        textAlign: 'center',
        fontWeight: '500',
    },
    activityCard: {
        marginBottom: SIZES.spacing.lg,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SIZES.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    activityText: {
        fontSize: SIZES.base,
        color: COLORS.text,
        marginLeft: SIZES.spacing.md,
        flex: 1,
    },
});

export default DashboardScreen;
