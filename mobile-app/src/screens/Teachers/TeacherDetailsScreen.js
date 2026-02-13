import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';
import api from '../../services/api';

const TeacherDetailsScreen = ({ route, navigation }) => {
    const { id } = route.params;
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchTeacherDetails();
    }, [id]);

    const fetchTeacherDetails = async () => {
        try {
            const response = await api.get(`/teachers/${id}`);
            if (response.data.success) {
                setTeacher(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching teacher details:', error);
            Alert.alert('Error', 'Failed to fetch teacher details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchTeacherDetails();
    };

    if (loading) return <LoadingSpinner />;
    if (!teacher) return (
        <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Teacher record not found</Text>
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
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    {teacher.profile_photo ? (
                        <Image source={{ uri: teacher.profile_photo }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person" size={50} color={COLORS.white} />
                        </View>
                    )}
                </View>
                <Text style={styles.name}>{teacher.first_name} {teacher.last_name}</Text>
                <Text style={styles.designation}>{teacher.specialization || 'Teacher'}</Text>
                
                <View style={[styles.statusBadge, { backgroundColor: teacher.status === 'active' ? '#E8F5E9' : '#F5F5F5' }]}>
                    <View style={[styles.statusDot, { backgroundColor: teacher.status === 'active' ? '#4CAF50' : '#9E9E9E' }]} />
                    <Text style={[styles.statusText, { color: teacher.status === 'active' ? '#2E7D32' : '#616161' }]}>
                        {teacher.status?.toUpperCase() || 'ACTIVE'}
                    </Text>
                </View>
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <Card style={styles.infoCard}>
                    <InfoRow label="Email" value={teacher.email} icon="mail-outline" />
                    <InfoRow label="Phone" value={teacher.phone} icon="call-outline" />
                    <InfoRow label="Address" value={teacher.address} icon="location-outline" />
                    {teacher.city && <InfoRow label="City" value={teacher.city} icon="business-outline" />}
                </Card>
            </View>

            {/* Professional Details */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Professional Details</Text>
                <Card style={styles.infoCard}>
                    <InfoRow label="Employee ID" value={teacher.employee_id} icon="id-card-outline" />
                    <InfoRow label="Qualification" value={teacher.qualification} icon="school-outline" />
                    <InfoRow label="Experience" value={`${teacher.experience_years || 0} Years`} icon="medal-outline" />
                    <InfoRow label="Joining Date" value={teacher.joining_date ? new Date(teacher.joining_date).toLocaleDateString() : 'N/A'} icon="calendar-outline" />
                </Card>
            </View>

            {/* Assignments Section */}
            {teacher.assignments && teacher.assignments.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Assigned Classes & Subjects</Text>
                    {teacher.assignments.map((assignment, index) => (
                        <Card key={index} style={styles.assignmentCard}>
                            <View style={styles.assignmentHeader}>
                                <View style={styles.subjectIcon}>
                                    <Ionicons name="book-outline" size={20} color={COLORS.primary} />
                                </View>
                                <View style={styles.assignmentInfo}>
                                    <Text style={styles.subjectName}>{assignment.subject_name}</Text>
                                    <Text style={styles.className}>{assignment.class_name} ({assignment.grade_level})</Text>
                                </View>
                                <View style={styles.codeBadge}>
                                    <Text style={styles.codeText}>{assignment.subject_code}</Text>
                                </View>
                            </View>
                        </Card>
                    ))}
                </View>
            )}

            {/* Personal Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <Card style={styles.infoCard}>
                    <InfoRow label="Gender" value={teacher.gender} icon="person-outline" />
                    <InfoRow label="Date of Birth" value={teacher.date_of_birth ? new Date(teacher.date_of_birth).toLocaleDateString() : 'N/A'} icon="calendar-clear-outline" />
                    <InfoRow label="Blood Group" value={teacher.blood_group} icon="water-outline" />
                </Card>
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
    header: { alignItems: 'center', marginBottom: SIZES.spacing.xl },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.white,
        padding: 4,
        ...SHADOWS.medium,
        marginBottom: SIZES.spacing.md,
    },
    avatar: { width: '100%', height: '100%', borderRadius: 50 },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: { fontSize: SIZES.xl, fontWeight: 'bold', color: COLORS.text },
    designation: { fontSize: SIZES.md, color: COLORS.primary, fontWeight: 'medium', marginTop: 4 },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 10,
    },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
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
    assignmentCard: { marginBottom: SIZES.spacing.sm, padding: SIZES.spacing.md },
    assignmentHeader: { flexDirection: 'row', alignItems: 'center' },
    subjectIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    assignmentInfo: { flex: 1 },
    subjectName: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text },
    className: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
    codeBadge: { backgroundColor: '#E0E7FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    codeText: { fontSize: 10, fontWeight: 'bold', color: COLORS.primary },
});

export default TeacherDetailsScreen;
