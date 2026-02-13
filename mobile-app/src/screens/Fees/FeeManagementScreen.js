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

const FeeManagementScreen = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ total: 0, count: 0, today: 0 });

    useEffect(() => {
        fetchFeeData();
    }, []);

    const fetchFeeData = async () => {
        try {
            // In a real app, we might have a specific dashboard endpoint, 
            // but here we'll derive stats from the payments list for now.
            const response = await api.get(ENDPOINTS.FEE_RECORDS);
            if (response.data.success) {
                const data = response.data.data;
                setPayments(data);
                
                const total = data.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
                const today = data
                    .filter(p => new Date(p.payment_date).toDateString() === new Date().toDateString())
                    .reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
                
                setStats({
                    total,
                    count: data.length,
                    today
                });
            }
        } catch (error) {
            console.error('Error fetching fee data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchFeeData();
    };

    const filteredPayments = payments.filter(p =>
        p.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const StatCard = ({ label, value, icon, color }) => (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <View style={styles.statIconContainer}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statValue}>{value}</Text>
            </View>
        </View>
    );

    const renderPayment = ({ item }) => (
        <Card style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
                <View>
                    <Text style={styles.receiptNo}>{item.receipt_number || 'N/A'}</Text>
                    <Text style={styles.studentName}>{item.student_name}</Text>
                </View>
                <Text style={styles.amountText}>₹{parseFloat(item.amount_paid).toLocaleString()}</Text>
            </View>
            <View style={styles.paymentFooter}>
                <View style={styles.footerItem}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.footerText}>
                        {new Date(item.payment_date).toLocaleDateString()}
                    </Text>
                </View>
                <View style={styles.footerItem}>
                    <Ionicons name="cash-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.footerText}>{item.fee_type}</Text>
                </View>
                <View style={styles.methodBadge}>
                    <Text style={styles.methodText}>{item.payment_method?.replace('_', ' ')}</Text>
                </View>
            </View>
        </Card>
    );

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            {/* Summary Stats */}
            <View style={styles.statsContainer}>
                <StatCard label="Total Collected" value={`₹${stats.total.toLocaleString()}`} icon="wallet-outline" color="#2E7D32" />
                <StatCard label="Today" value={`₹${stats.today.toLocaleString()}`} icon="today-outline" color="#1976D2" />
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by student or receipt..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    placeholderTextColor={COLORS.textLight}
                />
            </View>

            <FlatList
                data={filteredPayments}
                renderItem={renderPayment}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListHeaderComponent={
                    <Text style={styles.listTitle}>Recent Transactions</Text>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cash-outline" size={64} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>No fee records found</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    statsContainer: { flexDirection: 'row', padding: SIZES.spacing.lg, gap: SIZES.spacing.md },
    statCard: { flex: 1, backgroundColor: COLORS.surface, padding: SIZES.spacing.md, borderRadius: 12, borderLeftWidth: 4, flexDirection: 'row', alignItems: 'center', ...SHADOWS.small },
    statIconContainer: { marginRight: SIZES.spacing.sm },
    statLabel: { fontSize: 10, color: COLORS.textSecondary, textTransform: 'uppercase' },
    statValue: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text, marginTop: 2 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        marginHorizontal: SIZES.spacing.lg,
        marginBottom: SIZES.spacing.md,
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
    listTitle: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.spacing.md },
    paymentCard: { marginBottom: SIZES.spacing.md, padding: SIZES.spacing.md },
    paymentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SIZES.spacing.md },
    receiptNo: { fontSize: 10, color: COLORS.primary, fontWeight: 'bold', fontFamily: 'monospace' },
    studentName: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text, marginTop: 2 },
    amountText: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.text },
    paymentFooter: { flexDirection: 'row', alignItems: 'center' },
    footerItem: { flexDirection: 'row', alignItems: 'center', marginRight: SIZES.spacing.md },
    footerText: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginLeft: 4 },
    methodBadge: { marginLeft: 'auto', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: '#F0F0F0' },
    methodText: { fontSize: 8, fontWeight: 'bold', color: COLORS.textSecondary, textTransform: 'uppercase' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SIZES.spacing.xxl },
    emptyText: { fontSize: SIZES.md, color: COLORS.textSecondary, marginTop: SIZES.spacing.md },
});

export default FeeManagementScreen;
