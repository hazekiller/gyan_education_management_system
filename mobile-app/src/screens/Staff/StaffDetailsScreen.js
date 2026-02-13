import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';

const StaffDetailsScreen = ({ route, navigation }) => {
    const { id } = route.params;
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStaffDetails();
    }, [id]);

    const fetchStaffDetails = async () => {
        try {
            const response = await api.get(ENDPOINTS.STAFF_DETAILS(id));
            if (response.data.success) {
                setStaff(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching staff details:', error);
            Alert.alert('Error', 'Failed to fetch staff details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!staff) return (
        <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Staff record not found</Text>
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
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    {staff.profile_photo ? (
                        <Image source={{ uri: staff.profile_photo }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person" size={50} color={COLORS.white} />
                        </View>
                    )}
                </View>
                <Text style={styles.name}>{staff.first_name} {staff.last_name}</Text>
                <Text style={styles.designation}>{staff.designation || 'Staff Member'}</Text>
                
                <View style={[styles.statusBadge, { backgroundColor: staff.status === 'active' ? '#E8F5E9' : '#F5F5F5' }]}>
                    <View style={[styles.statusDot, { backgroundColor: staff.status === 'active' ? '#4CAF50' : '#9E9E9E' }]} />
                    <Text style={[styles.statusText, { color: staff.status === 'active' ? '#2E7D32' : '#616161' }]}>
                        {staff.status?.toUpperCase() || 'ACTIVE'}
                    </Text>
                </View>
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <Card style={styles.infoCard}>
                    <InfoRow label="Email" value={staff.email} icon="mail-outline" />
                    <InfoRow label="Phone" value={staff.phone} icon="call-outline" />
                    <InfoRow label="Address" value={staff.address} icon="location-outline" />
                </Card>
            </View>

            {/* Employment Details */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Employment Details</Text>
                <Card style={styles.infoCard}>
                    <InfoRow label="Employee ID" value={staff.employee_id} icon="id-card-outline" />
                    <InfoRow label="Department" value={staff.department || 'General'} icon="business-outline" />
                    <InfoRow label="Joining Date" value={staff.joining_date ? new Date(staff.joining_date).toLocaleDateString() : 'N/A'} icon="calendar-outline" />
                    <InfoRow label="Qualification" value={staff.qualification} icon="school-outline" />
                </Card>
            </View>

            {/* Other Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Other Information</Text>
                <Card style={styles.infoCard}>
                    <InfoRow label="Gender" value={staff.gender} icon="person-outline" />
                    <InfoRow label="Date of Birth" value={staff.date_of_birth ? new Date(staff.date_of_birth).toLocaleDateString() : 'N/A'} icon="calendar-clear-outline" />
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
});

export default StaffDetailsScreen;
