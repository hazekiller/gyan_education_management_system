import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';

const DailyReportDetailsScreen = ({ route, navigation }) => {
    const { id } = route.params;
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReportDetails();
    }, [id]);

    const fetchReportDetails = async () => {
        try {
            const response = await api.get(ENDPOINTS.DAILY_REPORT_DETAILS(id));
            if (response.data.success) {
                setReport(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching daily report details:', error);
            Alert.alert('Error', 'Failed to fetch report details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!report) return (
        <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Report not found</Text>
        </View>
    );

    const MetricBox = ({ label, value, color, icon }) => (
        <View style={[styles.metricBox, { backgroundColor: `${color}15`, borderColor: `${color}30` }]}>
            <Ionicons name={icon} size={24} color={color} />
            <Text style={[styles.metricValue, { color }]}>{value || '0'}</Text>
            <Text style={styles.metricLabel}>{label}</Text>
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header info */}
            <Card style={styles.headerCard}>
                <View style={styles.headerTop}>
                    <View style={styles.dateBadge}>
                        <Ionicons name="calendar" size={16} color={COLORS.primary} />
                        <Text style={styles.dateText}>
                            {new Date(report.report_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </Text>
                    </View>
                </View>
                <Text style={styles.teacherName}>{report.teacher_first_name} {report.teacher_last_name}</Text>
                <Text style={styles.classInfo}>
                    {report.class_name} {report.section || ''} • {report.subject_name || 'N/A'}
                </Text>
                {report.period_number && (
                    <View style={styles.periodBadge}>
                        <Text style={styles.periodText}>Period {report.period_number}</Text>
                    </View>
                )}
            </Card>

            {/* Metrics */}
            <View style={styles.metricsGrid}>
                <MetricBox label="Present" value={report.students_present} color="#2E7D32" icon="checkmark-circle" />
                <MetricBox label="Absent" value={report.students_absent} color="#C62828" icon="close-circle" />
                <MetricBox label="Engagement" value={report.student_engagement ? report.student_engagement.charAt(0).toUpperCase() + report.student_engagement.slice(1) : 'Normal'} color="#1976D2" icon="trending-up" />
            </View>

            {/* Activities */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Daily Work Summary</Text>
                <Card style={styles.contentCard}>
                    <Text style={styles.contentText}>{report.content}</Text>
                </Card>
            </View>

            {/* Topics & Homework */}
            <View style={styles.rowSection}>
                <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.sectionTitle}>Topics Covered</Text>
                    <Card style={styles.smallCard}>
                        <Text style={styles.smallCardText}>{report.topics_covered || 'No topics listed'}</Text>
                    </Card>
                </View>
                <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.sectionTitle}>Homework</Text>
                    <Card style={styles.smallCard}>
                        <Text style={styles.smallCardText}>{report.homework_assigned || 'No homework assigned'}</Text>
                    </Card>
                </View>
            </View>

            {/* Observations */}
            {report.challenges_faced && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Challenges Faced</Text>
                    <Card style={[styles.contentCard, { backgroundColor: '#FFF9C4' }]}>
                        <Text style={styles.contentText}>{report.challenges_faced}</Text>
                    </Card>
                </View>
            )}

            {report.achievements && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Achievements & Highlights</Text>
                    <Card style={[styles.contentCard, { backgroundColor: '#E8F5E9' }]}>
                        <Text style={styles.contentText}>{report.achievements}</Text>
                    </Card>
                </View>
            )}

            {report.remarks && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Additional Remarks</Text>
                    <Card style={styles.contentCard}>
                        <Text style={styles.contentText}>{report.remarks}</Text>
                    </Card>
                </View>
            )}
            
            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SIZES.spacing.lg },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: SIZES.md, color: COLORS.textSecondary },
    headerCard: { padding: SIZES.spacing.md, marginBottom: SIZES.spacing.lg, alignItems: 'center' },
    dateBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F7FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: SIZES.spacing.sm },
    dateText: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: 'bold', marginLeft: 6 },
    teacherName: { fontSize: SIZES.xl, fontWeight: 'bold', color: COLORS.text },
    classInfo: { fontSize: SIZES.md, color: COLORS.textSecondary, marginTop: 4 },
    periodBadge: { marginTop: 8, backgroundColor: COLORS.secondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    periodText: { fontSize: 10, fontWeight: 'bold', color: COLORS.primary },
    metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.spacing.lg },
    metricBox: { flex: 1, marginHorizontal: 4, padding: SIZES.spacing.sm, borderRadius: 12, borderWeight: 1, alignItems: 'center' },
    metricValue: { fontSize: SIZES.lg, fontWeight: 'bold', marginVertical: 2 },
    metricLabel: { fontSize: 8, textTransform: 'uppercase', color: COLORS.textSecondary },
    section: { marginBottom: SIZES.spacing.lg },
    sectionTitle: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.spacing.sm, marginLeft: 4 },
    contentCard: { padding: SIZES.spacing.md },
    contentText: { fontSize: SIZES.sm, color: COLORS.text, lineHeight: 20 },
    rowSection: { flexDirection: 'row' },
    smallCard: { padding: SIZES.spacing.sm, minHeight: 80 },
    smallCardText: { fontSize: SIZES.xs, color: COLORS.textSecondary },
});

export default DailyReportDetailsScreen;
