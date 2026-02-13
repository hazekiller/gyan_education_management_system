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

const AdmissionsScreen = ({ navigation }) => {
    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchAdmissions();
    }, []);

    const fetchAdmissions = async () => {
        try {
            const response = await api.get(ENDPOINTS.ADMISSIONS);
            if (response.data.success) {
                setAdmissions(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching admissions:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchAdmissions();
    };

    const filteredAdmissions = admissions.filter((item) =>
        `${item.first_name} ${item.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.application_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return { bg: '#FFF9C4', text: '#FBC02D' };
            case 'approved': return { bg: '#E3F2FD', text: '#1976D2' };
            case 'admitted': return { bg: '#E8F5E9', text: '#2E7D32' };
            case 'rejected': return { bg: '#FFEBEE', text: '#C62828' };
            default: return { bg: '#F5F5F5', text: '#616161' };
        }
    };

    const renderAdmission = ({ item }) => {
        const statusStyle = getStatusStyle(item.status);
        return (
            <Card
                onPress={() => navigation.navigate('AdmissionDetails', { id: item.id })}
                style={styles.card}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.headerInfo}>
                        <Text style={styles.appNumber}>{item.application_number}</Text>
                        <Text style={styles.studentName}>{item.first_name} {item.last_name}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {item.status?.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                        <Ionicons name="school-outline" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.detailText}>{item.class_name || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.detailText}>
                            {new Date(item.application_date).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                <View style={styles.parentRow}>
                    <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.parentText}>{item.parent_name} ({item.parent_phone})</Text>
                </View>
            </Card>
        );
    };

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search admissions..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={COLORS.textLight}
                />
            </View>

            <FlatList
                data={filteredAdmissions}
                renderItem={renderAdmission}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="file-tray-full-outline" size={64} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>No admission applications found</Text>
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
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerInfo: { flex: 1 },
    appNumber: { fontSize: SIZES.xs, color: COLORS.primary, fontWeight: 'bold', marginBottom: 2 },
    studentName: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    cardDivider: { height: 1, backgroundColor: '#EEE', marginVertical: SIZES.spacing.sm },
    detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.spacing.xs },
    detailItem: { flexDirection: 'row', alignItems: 'center' },
    detailText: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginLeft: 4 },
    parentRow: { flexDirection: 'row', alignItems: 'center', marginTop: SIZES.spacing.xs },
    parentText: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginLeft: 4 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SIZES.spacing.xxl },
    emptyText: { fontSize: SIZES.md, color: COLORS.textSecondary, marginTop: SIZES.spacing.md },
});

export default AdmissionsScreen;
