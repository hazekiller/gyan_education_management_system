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
import StatCard from '../../components/StatCard';
import api from '../../services/api';

const ClassDetailsScreen = ({ route, navigation }) => {
    const { id } = route.params;
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchClassDetails();
    }, [id]);

    const fetchClassDetails = async () => {
        try {
            const response = await api.get(`/classes/${id}`);
            if (response.data.success) {
                setClassData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching class details:', error);
            Alert.alert('Error', 'Failed to fetch class details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchClassDetails();
    };

    if (loading) return <LoadingSpinner />;
    if (!classData) return (
        <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Class not found</Text>
        </View>
    );

    const InfoRow = ({ label, value, icon }) => (
        <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
                {icon && <Ionicons name={icon} size={18} color={COLORS.textSecondary} style={styles.rowIcon} />}
                <Text style={styles.label}>{label}</Text>
            </View>
            <Text style={styles.value}>{value || 'N/A'}</Text>
        </View>
    );

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Header / Stats */}
            <View style={styles.header}>
                <Text style={styles.className}>{classData.name}</Text>
                <Text style={styles.gradeLevel}>Grade {classData.grade_level}</Text>
                
                <View style={styles.statsContainer}>
                    <StatCard 
                        label="Students" 
                        value={classData.student_count || 0} 
                        icon="people" 
                        color={COLORS.info} 
                    />
                    <StatCard 
                        label="Sections" 
                        value={classData.sections?.length || 0} 
                        icon="layers" 
                        color={COLORS.success} 
                    />
                </View>
            </View>

            {/* Overview Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Overview</Text>
                <Card style={styles.infoCard}>
                    <InfoRow label="Academic Year" value={classData.academic_year} icon="calendar-outline" />
                    <InfoRow label="Room Number" value={classData.room_number} icon="door-open-outline" />
                    <InfoRow label="Capacity" value={classData.capacity} icon="people-outline" />
                    <InfoRow label="Status" value={classData.status?.toUpperCase()} icon="information-circle-outline" />
                </Card>
            </View>

            {/* Class Teacher Section */}
            {classData.class_teacher_name && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Class Teacher</Text>
                    <Card style={styles.teacherCard}>
                        <View style={styles.teacherHeader}>
                            <View style={styles.teacherAvatar}>
                                <Ionicons name="person" size={24} color={COLORS.primary} />
                            </View>
                            <View style={styles.teacherInfo}>
                                <Text style={styles.teacherName}>{classData.class_teacher_name}</Text>
                                <Text style={styles.teacherId}>{classData.teacher_employee_id}</Text>
                            </View>
                        </View>
                        <View style={styles.teacherContact}>
                            <InfoRow label="Email" value={classData.teacher_email} icon="mail-outline" />
                            <InfoRow label="Phone" value={classData.teacher_phone} icon="call-outline" />
                        </View>
                    </Card>
                </View>
            )}

            {/* Sections List */}
            {classData.sections && classData.sections.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sections</Text>
                    {classData.sections.map((section, index) => (
                        <Card key={index} style={styles.listCard}>
                            <View style={styles.row}>
                                <View style={styles.sectionIcon}>
                                    <Text style={styles.sectionInitial}>{section.name.charAt(0)}</Text>
                                </View>
                                <View style={styles.flex1}>
                                    <Text style={styles.listTitle}>Section {section.name}</Text>
                                    <Text style={styles.listSubtitle}>Teacher: {section.class_teacher_name || 'Not Assigned'}</Text>
                                </View>
                                <View style={styles.countBadge}>
                                    <Text style={styles.countText}>{section.student_count} Students</Text>
                                </View>
                            </View>
                        </Card>
                    ))}
                </View>
            )}

            {/* Subject Teachers */}
            {classData.subject_teachers && classData.subject_teachers.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Subject Teachers</Text>
                    {classData.subject_teachers.map((st, index) => (
                        <Card key={index} style={styles.listCard}>
                            <View style={styles.row}>
                                <View style={styles.subjectIcon}>
                                    <Ionicons name="book-outline" size={20} color={COLORS.primary} />
                                </View>
                                <View style={styles.flex1}>
                                    <Text style={styles.listTitle}>{st.subject_name}</Text>
                                    <Text style={styles.listSubtitle}>{st.teacher_name}</Text>
                                </View>
                                <View style={styles.codeBadge}>
                                    <Text style={styles.codeText}>{st.subject_code}</Text>
                                </View>
                            </View>
                        </Card>
                    ))}
                </View>
            )}

            {classData.description && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Card style={styles.descriptionCard}>
                        <Text style={styles.descriptionText}>{classData.description}</Text>
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
    header: { alignItems: 'center', marginBottom: SIZES.spacing.xl },
    className: { fontSize: SIZES.xxl, fontWeight: 'bold', color: COLORS.text },
    gradeLevel: { fontSize: SIZES.md, color: COLORS.primary, fontWeight: '600', marginTop: 4, marginBottom: SIZES.spacing.lg },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: SIZES.spacing.md },
    section: { marginBottom: SIZES.spacing.lg },
    sectionTitle: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.spacing.sm, marginLeft: 4 },
    infoCard: { padding: SIZES.spacing.sm },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SIZES.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    labelContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    rowIcon: { marginRight: 8 },
    label: { fontSize: SIZES.sm, color: COLORS.textSecondary },
    value: { fontSize: SIZES.sm, fontWeight: 'medium', color: COLORS.text, flex: 1, textAlign: 'right' },
    teacherCard: { padding: SIZES.spacing.md },
    teacherHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.spacing.md },
    teacherAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    teacherName: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text },
    teacherId: { fontSize: SIZES.xs, color: COLORS.textSecondary },
    teacherContact: { borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: SIZES.spacing.xs },
    listCard: { marginBottom: SIZES.spacing.sm, padding: SIZES.spacing.md },
    row: { flexDirection: 'row', alignItems: 'center' },
    flex1: { flex: 1 },
    sectionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    sectionInitial: { fontSize: SIZES.md, fontWeight: 'bold', color: '#2E7D32' },
    listTitle: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text },
    listSubtitle: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
    countBadge: { backgroundColor: '#F0F9FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    countText: { fontSize: 10, fontWeight: 'bold', color: '#0369A1' },
    subjectIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    codeBadge: { backgroundColor: '#E0E7FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    codeText: { fontSize: 10, fontWeight: 'bold', color: COLORS.primary },
    descriptionCard: { padding: SIZES.spacing.md },
    descriptionText: { fontSize: SIZES.sm, color: COLORS.text, lineHeight: 20 },
});

export default ClassDetailsScreen;
