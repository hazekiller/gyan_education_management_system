import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';

const DailyReportsScreen = ({ navigation }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await api.get(ENDPOINTS.DAILY_REPORTS);
            if (response.data.success) {
                setReports(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching daily reports:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchReports();
    };

    const filteredReports = reports.filter((item) =>
        `${item.teacher_first_name} ${item.teacher_last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderReport = ({ item }) => (
        <Card
            onPress={() => navigation.navigate('DailyReportDetails', { id: item.id })}
            style={styles.card}
        >
            <View style={styles.cardHeader}>
                <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.dateText}>
                        {new Date(item.report_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </Text>
                </View>
                <TouchableOpacity style={styles.viewBtn}>
                    <Ionicons name="eye-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.teacherInfo}>
                <Text style={styles.teacherName}>
                    {item.teacher_first_name} {item.teacher_last_name}
                </Text>
                <Text style={styles.classInfo}>
                    {item.class_name} {item.section || ''} • {item.subject_name || 'N/A'}
                </Text>
            </View>

            <Text style={styles.contentPreview} numberOfLines={2}>
                {item.content}
            </Text>

            <View style={styles.metricsRow}>
                {item.students_present !== null && (
                    <View style={[styles.metricItem, styles.presentMetric]}>
                        <Text style={styles.metricLabel}>Present</Text>
                        <Text style={styles.metricValue}>{item.students_present}</Text>
                    </View>
                )}
                {item.students_absent !== null && (
                    <View style={[styles.metricItem, styles.absentMetric]}>
                        <Text style={styles.metricLabel}>Absent</Text>
                        <Text style={styles.metricValue}>{item.students_absent}</Text>
                    </View>
                )}
                {item.period_number && (
                    <View style={[styles.metricItem, styles.periodMetric]}>
                        <Text style={styles.metricLabel}>Period</Text>
                        <Text style={styles.metricValue}>{item.period_number}</Text>
                    </View>
                )}
            </View>
        </Card>
    );

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={COLORS.textLight}
                />
            </View>

            <FlatList
                data={filteredReports}
                renderItem={renderReport}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>No daily reports found</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        margin: SIZES.spacing.lg,
        paddingHorizontal: SIZES.spacing.md,
        borderRadius: SIZES.radius.md,
        ...SHADOWS.small,
    },
    searchInput: {
        flex: 1,
        paddingVertical: SIZES.spacing.md,
        paddingHorizontal: SIZES.spacing.sm,
        fontSize: SIZES.md,
        color: COLORS.text,
    },
    listContent: { padding: SIZES.spacing.lg, paddingTop: 0 },
    card: { marginBottom: SIZES.spacing.md, padding: SIZES.spacing.md },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacing.sm },
    dateContainer: { flexDirection: 'row', alignItems: 'center' },
    dateText: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text, marginLeft: SIZES.spacing.xs },
    viewBtn: { padding: 4 },
    teacherInfo: { marginBottom: SIZES.spacing.sm },
    teacherName: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text },
    classInfo: { fontSize: SIZES.sm, color: COLORS.textSecondary },
    contentPreview: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: SIZES.spacing.md },
    metricsRow: { flexDirection: 'row', gap: SIZES.spacing.sm },
    metricItem: { flex: 1, padding: 8, borderRadius: 8, alignItems: 'center', borderWeight: 1 },
    presentMetric: { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' },
    absentMetric: { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' },
    periodMetric: { backgroundColor: '#E3F2FD', borderColor: '#BBDEFB' },
    metricLabel: { fontSize: 10, color: COLORS.textSecondary, marginBottom: 2 },
    metricValue: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SIZES.spacing.xxl },
    emptyText: { fontSize: SIZES.md, color: COLORS.textSecondary, marginTop: SIZES.spacing.md },
});

export default DailyReportsScreen;
