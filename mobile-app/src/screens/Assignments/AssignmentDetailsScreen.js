import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';

const AssignmentDetailsScreen = ({ route, navigation }) => {
    const { id } = route.params;
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAssignmentDetails();
    }, [id]);

    const fetchAssignmentDetails = async () => {
        try {
            const response = await api.get(ENDPOINTS.ASSIGNMENT_DETAILS(id));
            if (response.data.success) {
                setAssignment(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching assignment details:', error);
            Alert.alert('Error', 'Failed to fetch assignment details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchAssignmentDetails();
    };

    if (loading) return <LoadingSpinner />;
    if (!assignment) return (
        <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Assignment not found</Text>
        </View>
    );

    const isOverdue = new Date(assignment.due_date) < new Date();

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <View style={styles.badgeRow}>
                    <View style={[styles.subjectBadge, { backgroundColor: `${COLORS.primary}15` }]}>
                        <Text style={[styles.subjectText, { color: COLORS.primary }]}>{assignment.subject_name || 'General'}</Text>
                    </View>
                    {isOverdue && (
                        <View style={styles.overdueBadge}>
                            <Text style={styles.overdueText}>OVERDUE</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.title}>{assignment.title}</Text>
                <View style={styles.metaRow}>
                    <Ionicons name="person-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.metaText}>By: {assignment.teacher_first_name} {assignment.teacher_last_name}</Text>
                </View>
            </View>

            <View style={styles.summaryCards}>
                <Card style={styles.summaryCard}>
                    <Ionicons name="calendar" size={20} color={isOverdue ? '#EF4444' : COLORS.primary} />
                    <Text style={styles.summaryLabel}>Due Date</Text>
                    <Text style={[styles.summaryValue, isOverdue && { color: '#EF4444' }]}>
                        {new Date(assignment.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                </Card>
                <Card style={styles.summaryCard}>
                    <Ionicons name="ribbon" size={20} color="#F59E0B" />
                    <Text style={styles.summaryLabel}>Max Marks</Text>
                    <Text style={styles.summaryValue}>{assignment.total_marks || '100'}</Text>
                </Card>
                <Card style={styles.summaryCard}>
                    <Ionicons name="people" size={20} color="#10B981" />
                    <Text style={styles.summaryLabel}>Class</Text>
                    <Text style={styles.summaryValue}>{assignment.class_name}</Text>
                </Card>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Instructions</Text>
                <Card style={styles.descriptionCard}>
                    <Text style={styles.descriptionText}>{assignment.description || 'No instructions provided.'}</Text>
                </Card>
            </View>

            {assignment.attachments && assignment.attachments.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Attachments</Text>
                    {assignment.attachments.map((file, index) => (
                        <TouchableOpacity key={index} style={styles.attachmentItem}>
                            <Ionicons name="document-attach" size={20} color={COLORS.primary} />
                            <Text style={styles.attachmentName} numberOfLines={1}>
                                {file.split('/').pop()}
                            </Text>
                            <Ionicons name="download-outline" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    ))}
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
    header: { marginBottom: SIZES.spacing.xl },
    badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    subjectBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    subjectText: { fontSize: 10, fontWeight: 'bold' },
    overdueBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    overdueText: { color: '#EF4444', fontSize: 10, fontWeight: 'bold' },
    title: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
    summaryCards: { flexDirection: 'row', gap: SIZES.spacing.md, marginBottom: SIZES.spacing.xl },
    summaryCard: { flex: 1, alignItems: 'center', padding: 12 },
    summaryLabel: { fontSize: 8, color: COLORS.textSecondary, marginTop: 4, textTransform: 'uppercase' },
    summaryValue: { fontSize: SIZES.sm, fontWeight: 'bold', color: COLORS.text, marginTop: 2 },
    section: { marginBottom: SIZES.spacing.xl },
    sectionTitle: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.spacing.sm },
    descriptionCard: { padding: SIZES.spacing.md },
    descriptionText: { fontSize: SIZES.sm, color: COLORS.text, lineHeight: 22 },
    attachmentItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: COLORS.surface, 
        padding: 12, 
        borderRadius: 12, 
        marginBottom: 8,
        ...SHADOWS.small 
    },
    attachmentName: { flex: 1, fontSize: SIZES.sm, color: COLORS.text, marginHorizontal: 12 },
});

export default AssignmentDetailsScreen;
