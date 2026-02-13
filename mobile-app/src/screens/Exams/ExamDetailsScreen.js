import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';

const ExamDetailsScreen = ({ route, navigation }) => {
    const { id } = route.params;
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchExamDetails();
    }, [id]);

    const fetchExamDetails = async () => {
        try {
            const response = await api.get(ENDPOINTS.EXAM_DETAILS(id));
            if (response.data.success) {
                setExam(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching exam details:', error);
            Alert.alert('Error', 'Failed to fetch exam details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchExamDetails();
    };

    if (loading) return <LoadingSpinner />;
    if (!exam) return (
        <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Exam not found</Text>
        </View>
    );

    const InfoCard = ({ icon, label, value, color = COLORS.primary }) => (
        <View style={styles.infoItem}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || 'N/A'}</Text>
            </View>
        </View>
    );

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <View style={styles.badgeContainer}>
                    <View style={styles.typeBadge}>
                        <Text style={styles.typeText}>{exam.exam_type?.toUpperCase() || 'GENERAL'}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
                        <Text style={[styles.statusText, { color: '#2E7D32' }]}>ACTIVE</Text>
                    </View>
                </View>
                <Text style={styles.title}>{exam.name}</Text>
                <Text style={styles.className}>{exam.class_name || 'All Classes'}</Text>
            </View>

            <View style={styles.statsRow}>
                <Card style={styles.statBox}>
                    <Text style={styles.statLabel}>Total Marks</Text>
                    <Text style={styles.statValue}>{exam.total_marks}</Text>
                </Card>
                <Card style={styles.statBox}>
                    <Text style={styles.statLabel}>Passing Marks</Text>
                    <Text style={[styles.statValue, { color: '#10B981' }]}>{exam.passing_marks}</Text>
                </Card>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Schedule Details</Text>
                <Card style={styles.detailsCard}>
                    <InfoCard 
                        icon="calendar" 
                        label="Start Date" 
                        value={new Date(exam.start_date).toLocaleDateString()} 
                    />
                    <View style={styles.divider} />
                    <InfoCard 
                        icon="calendar-outline" 
                        label="End Date" 
                        value={new Date(exam.end_date).toLocaleDateString()} 
                    />
                    <View style={styles.divider} />
                    <InfoCard 
                        icon="time-outline" 
                        label="Academic Year" 
                        value={exam.academic_year} 
                    />
                </Card>
            </View>

            {exam.description && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description & Instructions</Text>
                    <Card style={styles.descriptionCard}>
                        <Text style={styles.descriptionText}>{exam.description}</Text>
                    </Card>
                </View>
            )}

            <View style={styles.footerInfo}>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.footerText}>Please contact the administration for any schedule changes.</Text>
            </View>
            
            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SIZES.spacing.lg },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: SIZES.md, color: COLORS.textSecondary },
    header: { marginBottom: SIZES.spacing.xl },
    badgeContainer: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    typeBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    typeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
    className: { fontSize: SIZES.md, color: COLORS.textSecondary },
    statsRow: { flexDirection: 'row', gap: SIZES.spacing.md, marginBottom: SIZES.spacing.xl },
    statBox: { flex: 1, alignItems: 'center', padding: SIZES.spacing.md },
    statLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
    statValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
    section: { marginBottom: SIZES.spacing.xl },
    sectionTitle: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.spacing.sm },
    detailsCard: { padding: SIZES.spacing.md },
    infoItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    infoLabel: { fontSize: 12, color: COLORS.textSecondary },
    infoValue: { fontSize: SIZES.md, fontWeight: 'medium', color: COLORS.text },
    divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 4 },
    descriptionCard: { padding: SIZES.spacing.md },
    descriptionText: { fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 22 },
    footerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
    footerText: { fontSize: 12, color: COLORS.textSecondary, flex: 1 },
});

export default ExamDetailsScreen;
