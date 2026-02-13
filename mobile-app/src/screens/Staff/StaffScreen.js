import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    TextInput,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';

const StaffScreen = ({ navigation }) => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const response = await api.get(ENDPOINTS.STAFF);
            if (response.data.success) {
                setStaff(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchStaff();
    };

    const filteredStaff = staff.filter((item) =>
        `${item.first_name} ${item.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.employee_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderStaffMember = ({ item }) => (
        <Card
            onPress={() => navigation.navigate('StaffDetails', { id: item.id })}
            style={styles.staffCard}
        >
            <View style={styles.staffHeader}>
                <View style={styles.avatarContainer}>
                    {item.profile_image ? (
                        <Image source={{ uri: item.profile_image }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {item.first_name?.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.staffInfo}>
                    <Text style={styles.staffName}>{item.first_name} {item.last_name}</Text>
                    <Text style={styles.staffRole}>{item.role?.toUpperCase()}</Text>
                    <View style={styles.contactRow}>
                        <Ionicons name="call-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.contactText}>{item.phone || 'N/A'}</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
            </View>
        </Card>
    );

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search staff..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={COLORS.textLight}
                />
            </View>

            {/* Staff List */}
            <FlatList
                data={filteredStaff}
                renderItem={renderStaffMember}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>No staff members found</Text>
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
    staffCard: { marginBottom: SIZES.spacing.md },
    staffHeader: { flexDirection: 'row', alignItems: 'center' },
    avatarContainer: { marginRight: SIZES.spacing.md },
    avatar: { width: 56, height: 56, borderRadius: 28 },
    avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: SIZES.xl, fontWeight: 'bold', color: COLORS.white },
    staffInfo: { flex: 1 },
    staffName: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text, marginBottom: 2 },
    staffRole: { fontSize: SIZES.xs, color: COLORS.primary, fontWeight: 'bold', marginBottom: 4 },
    contactRow: { flexDirection: 'row', alignItems: 'center' },
    contactText: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginLeft: 4 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SIZES.spacing.xxl },
    emptyText: { fontSize: SIZES.md, color: COLORS.textSecondary, marginTop: SIZES.spacing.md },
});

export default StaffScreen;
