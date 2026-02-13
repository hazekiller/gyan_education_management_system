import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';

const AdmissionDetailsScreen = ({ route, navigation }) => {
    const { id } = route.params;
    const [admission, setAdmission] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdmissionDetails();
    }, [id]);

    const fetchAdmissionDetails = async () => {
        try {
            const response = await api.get(ENDPOINTS.ADMISSION_DETAILS(id));
            if (response.data.success) {
                setAdmission(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching admission details:', error);
            Alert.alert('Error', 'Failed to fetch admission details');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return { bg: '#FFF9C4', text: '#FBC02D' };
            case 'approved': return { bg: '#E3F2FD', text: '#1976D2' };
            case 'admitted': return { bg: '#E8F5E9', text: '#2E7D32' };
            case 'rejected': return { bg: '#FFEBEE', text: '#C62828' };
            default: return { bg: '#F5F5F5', text: '#616161' };
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!admission) return (
        <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Admission record not found</Text>
        </View>
    );

    const statusStyle = getStatusStyle(admission.status);

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
            {/* Header Card */}
            <Card style={styles.headerCard}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.appNumber}>{admission.application_number}</Text>
                        <Text style={styles.fullName}>{admission.first_name} {admission.last_name}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {admission.status?.toUpperCase()}
                        </Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.headerStats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Class Applied</Text>
                        <Text style={styles.statValue}>{admission.class_name}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Applied On</Text>
                        <Text style={styles.statValue}>
                            {new Date(admission.application_date).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
            </Card>

            {/* Personal Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <Card style={styles.sectionCard}>
                    <InfoRow label="Gender" value={admission.gender} icon="person-outline" />
                    <InfoRow label="Date of Birth" value={admission.date_of_birth ? new Date(admission.date_of_birth).toLocaleDateString() : 'N/A'} icon="calendar-outline" />
                    <InfoRow label="Blood Group" value={admission.blood_group} icon="water-outline" />
                    <InfoRow label="Address" value={admission.address} icon="location-outline" />
                </Card>
            </View>

            {/* Parent/Guardian Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Parent / Guardian Information</Text>
                <Card style={styles.sectionCard}>
                    <InfoRow label="Guardian Name" value={admission.parent_name} icon="people-outline" />
                    <InfoRow label="Phone Number" value={admission.parent_phone} icon="call-outline" />
                    <InfoRow label="Email" value={admission.parent_email} icon="mail-outline" />
                    <InfoRow label="Occupation" value={admission.parent_occupation} icon="briefcase-outline" />
                </Card>
            </View>

            {/* Academic Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Previous Academic Information</Text>
                <Card style={styles.sectionCard}>
                    <InfoRow label="Previous School" value={admission.previous_school} icon="business-outline" />
                    <InfoRow label="Last Grade" value={admission.last_grade} icon="medal-outline" />
                </Card>
            </View>

            {/* Actions for Admin/Principal (Placeholder for now) */}
            {['super_admin', 'principal', 'admin'].includes(admission.current_user_role) && (
                <View style={styles.actionContainer}>
                    <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => Alert.alert('Coming Soon', 'Status update is coming soon!')}>
                        <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} />
                        <Text style={styles.actionBtnText}>Update Status</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SIZES.spacing.lg },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: SIZES.md, color: COLORS.textSecondary },
    headerCard: { padding: SIZES.spacing.md, marginBottom: SIZES.spacing.lg },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SIZES.spacing.md },
    appNumber: { fontSize: SIZES.xs, color: COLORS.primary, fontWeight: 'bold' },
    fullName: { fontSize: SIZES.xl, fontWeight: 'bold', color: COLORS.text, marginTop: 4 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#EEE', marginVertical: SIZES.spacing.md },
    headerStats: { flexDirection: 'row', justifyContent: 'space-between' },
    statItem: { flex: 1 },
    statLabel: { fontSize: 10, color: COLORS.textSecondary, textTransform: 'uppercase' },
    statValue: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text, marginTop: 2 },
    section: { marginBottom: SIZES.spacing.lg },
    sectionTitle: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.spacing.sm, marginLeft: 4 },
    sectionCard: { padding: SIZES.spacing.sm },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SIZES.spacing.sm, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    labelContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    rowIcon: { marginRight: 8 },
    label: { fontSize: SIZES.sm, color: COLORS.textSecondary },
    value: { fontSize: SIZES.sm, fontWeight: 'medium', color: COLORS.text, flex: 1, textAlign: 'right' },
    actionContainer: { marginTop: SIZES.spacing.sm, marginBottom: SIZES.spacing.xl },
    actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, padding: 14, borderRadius: 12, ...SHADOWS.medium },
    actionBtnText: { color: COLORS.white, fontWeight: 'bold', marginLeft: 8, fontSize: SIZES.md },
    approveBtn: { backgroundColor: '#4CAF50' },
});

export default AdmissionDetailsScreen;
