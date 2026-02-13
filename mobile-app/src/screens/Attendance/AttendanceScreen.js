import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';

const AttendanceScreen = () => {
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [attendanceRes, statsRes] = await Promise.all([
                api.get(ENDPOINTS.ATTENDANCE),
                api.get(`${ENDPOINTS.ATTENDANCE}/stats`)
            ]);

            if (attendanceRes.data.success) {
                setAttendance(attendanceRes.data.data || []);
            }
            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'present': return { color: '#10B981', bg: '#DCFCE7', icon: 'checkmark-circle' };
            case 'absent': return { color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle' };
            case 'late': return { color: '#F59E0B', bg: '#FEF3C7', icon: 'time' };
            default: return { color: COLORS.textSecondary, bg: '#F5F5F5', icon: 'help-circle' };
        }
    };

    const renderStatCard = (label, value, color, icon) => (
        <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={styles.statValue}>{value || 0}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );

    const renderAttendanceItem = ({ item }) => {
        const date = new Date(item.date);
        const styles_stat = getStatusStyles(item.status);

        return (
            <Card style={styles.itemCard}>
                <View style={styles.itemRow}>
                    <View style={styles.dateInfo}>
                        <Text style={styles.itemDay}>{date.toLocaleDateString('en-US', { day: '2-digit' })}</Text>
                        <Text style={styles.itemMonth}>{date.toLocaleDateString('en-US', { month: 'short' })}</Text>
                    </View>
                    <View style={styles.dividerVertical} />
                    <View style={styles.attendanceDetails}>
                        <Text style={styles.itemSubject}>{item.subject_name || 'General Attendance'}</Text>
                        <Text style={styles.itemType}>{item.class_name} - {item.section_name}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: styles_stat.bg }]}>
                        <Ionicons name={styles_stat.icon} size={14} color={styles_stat.color} />
                        <Text style={[styles.statusText, { color: styles_stat.color }]}>
                            {item.status?.toUpperCase()}
                        </Text>
                    </View>
                </View>
            </Card>
        );
    };

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            {/* Stats Header */}
            <View style={styles.statsHeader}>
                <View style={styles.overviewRow}>
                    <View style={styles.percentageCircle}>
                        <Text style={styles.percentageText}>{stats?.attendance_percentage || 0}%</Text>
                        <Text style={styles.percentageLabel}>Attendance</Text>
                    </View>
                    <View style={styles.statsGrid}>
                        <View style={styles.statsRow}>
                            {renderStatCard('Present', stats?.present_count, '#10B981', 'checkmark-circle')}
                            {renderStatCard('Absent', stats?.absent_count, '#EF4444', 'close-circle')}
                        </View>
                        <View style={styles.statsRow}>
                            {renderStatCard('Late', stats?.late_count, '#F59E0B', 'time')}
                            {renderStatCard('Total Days', stats?.total_days, COLORS.primary, 'calendar')}
                        </View>
                    </View>
                </View>
            </View>

            <Text style={styles.historyTitle}>Attendance History</Text>

            <FlatList
                data={attendance}
                renderItem={renderAttendanceItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={64} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>No attendance records found</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    statsHeader: { 
        backgroundColor: COLORS.surface, 
        padding: SIZES.spacing.lg, 
        borderBottomLeftRadius: 30, 
        borderBottomRightRadius: 30,
        ...SHADOWS.medium,
        marginBottom: SIZES.spacing.lg,
    },
    overviewRow: { flexDirection: 'row', alignItems: 'center' },
    percentageCircle: { 
        width: 100, 
        height: 100, 
        borderRadius: 50, 
        borderWidth: 6, 
        borderColor: COLORS.primary, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginRight: SIZES.spacing.lg,
    },
    percentageText: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.primary },
    percentageLabel: { fontSize: 8, color: COLORS.textSecondary, textTransform: 'uppercase' },
    statsGrid: { flex: 1 },
    statsRow: { flexDirection: 'row', gap: SIZES.spacing.sm, marginBottom: SIZES.spacing.sm },
    statCard: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 8, alignItems: 'center' },
    statIcon: { padding: 4, borderRadius: 8, marginBottom: 4 },
    statValue: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text },
    statLabel: { fontSize: 8, color: COLORS.textSecondary },
    historyTitle: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text, marginLeft: SIZES.spacing.lg, marginBottom: SIZES.spacing.sm },
    listContent: { padding: SIZES.spacing.lg, paddingTop: 0 },
    itemCard: { marginBottom: SIZES.spacing.sm, padding: SIZES.spacing.md },
    itemRow: { flexDirection: 'row', alignItems: 'center' },
    dateInfo: { alignItems: 'center', paddingRight: SIZES.spacing.md },
    itemDay: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.text },
    itemMonth: { fontSize: 10, color: COLORS.textSecondary, textTransform: 'uppercase' },
    dividerVertical: { width: 1, height: '80%', backgroundColor: '#E5E7EB', marginHorizontal: SIZES.spacing.md },
    attendanceDetails: { flex: 1 },
    itemSubject: { fontSize: SIZES.sm, fontWeight: 'bold', color: COLORS.text },
    itemType: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
    statusText: { fontSize: 8, fontWeight: 'bold' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SIZES.spacing.xxl },
    emptyText: { fontSize: SIZES.md, color: COLORS.textSecondary, marginTop: SIZES.spacing.md },
});

export default AttendanceScreen;
