import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';

const TransportScreen = () => {
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState(user?.role === 'student' ? 'my-transport' : 'vehicles');
    const [vehicles, setVehicles] = useState([]);
    const [myTransport, setMyTransport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const isAdmin = ['super_admin', 'admin', 'principal'].includes(user?.role);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'vehicles') {
                const response = await api.get(ENDPOINTS.TRANSPORT_VEHICLES);
                if (response.data.success) {
                    setVehicles(response.data.data);
                }
            } else {
                const response = await api.get(ENDPOINTS.TRANSPORT_MY_TRANSPORT);
                if (response.data.success) {
                    setMyTransport(response.data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching transport data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const renderVehicleItem = ({ item }) => (
        <Card style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
                <View style={styles.vehicleIconContainer}>
                    <Ionicons name="bus-outline" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.vehicleInfo}>
                    <Text style={styles.busNumber}>{item.bus_number}</Text>
                    <Text style={styles.regNumber}>{item.registration_number}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#E8F5E9' : '#F5F5F5' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'active' ? '#2E7D32' : '#616161' }]}>
                        {item.status?.toUpperCase()}
                    </Text>
                </View>
            </View>
            <View style={styles.driverInfo}>
                <Ionicons name="person-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.driverText}>{item.driver_name} • {item.driver_phone}</Text>
            </View>
        </Card>
    );

    const MyTransportView = () => {
        if (!myTransport) return (
            <View style={styles.emptyContainer}>
                <Ionicons name="bus-outline" size={64} color={COLORS.textLight} />
                <Text style={styles.emptyText}>No transport subscription found</Text>
            </View>
        );

        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <Card style={styles.myTransportCard}>
                    <View style={styles.routeHeader}>
                        <View>
                            <Text style={styles.routeName}>{myTransport.route_name}</Text>
                            <Text style={styles.busInfo}>{myTransport.bus_number} ({myTransport.registration_number})</Text>
                        </View>
                        <View style={styles.seatBadge}>
                            <Text style={styles.seatLabel}>SEAT</Text>
                            <Text style={styles.seatValue}>{myTransport.seat_number || '-'}</Text>
                        </View>
                    </View>

                    <View style={styles.stopsContainer}>
                        <View style={styles.stopItem}>
                            <View style={[styles.stopDot, { backgroundColor: '#4CAF50' }]} />
                            <View style={styles.stopInfo}>
                                <Text style={styles.stopLabel}>Pickup Point</Text>
                                <Text style={styles.stopName}>{myTransport.pickup_name}</Text>
                                <Text style={styles.stopTime}>{myTransport.pickup_time?.slice(0, 5)} AM</Text>
                            </View>
                        </View>
                        <View style={styles.stopConnector} />
                        <View style={styles.stopItem}>
                            <View style={[styles.stopDot, { backgroundColor: '#F44336' }]} />
                            <View style={styles.stopInfo}>
                                <Text style={styles.stopLabel}>Drop Point</Text>
                                <Text style={styles.stopName}>{myTransport.drop_name}</Text>
                                <Text style={styles.stopTime}>{myTransport.drop_time?.slice(0, 5)} PM</Text>
                            </View>
                        </View>
                    </View>
                </Card>

                <Text style={styles.sectionTitle}>Driver Details</Text>
                <Card style={styles.driverCard}>
                    <View style={styles.crewItem}>
                        <View style={styles.crewAvatar}>
                            <Ionicons name="person" size={20} color={COLORS.white} />
                        </View>
                        <View style={styles.crewInfo}>
                            <Text style={styles.crewName}>{myTransport.driver_name}</Text>
                            <Text style={styles.crewRole}>Primary Driver</Text>
                            <Text style={styles.crewPhone}>{myTransport.driver_phone}</Text>
                        </View>
                        <TouchableOpacity style={styles.callButton}>
                            <Ionicons name="call" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                </Card>
            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            {/* Tabs (only for Admin/Staff) */}
            {isAdmin && (
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'vehicles' && styles.activeTab]}
                        onPress={() => setActiveTab('vehicles')}
                    >
                        <Text style={[styles.tabText, activeTab === 'vehicles' && styles.activeTabText]}>Vehicles</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'my-transport' && styles.activeTab]}
                        onPress={() => setActiveTab('my-transport')}
                    >
                        <Text style={[styles.tabText, activeTab === 'my-transport' && styles.activeTabText]}>My Transport</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading ? (
                <LoadingSpinner />
            ) : activeTab === 'vehicles' ? (
                <FlatList
                    data={vehicles}
                    renderItem={renderVehicleItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="bus-outline" size={64} color={COLORS.textLight} />
                            <Text style={styles.emptyText}>No vehicles found</Text>
                        </View>
                    }
                />
            ) : (
                <MyTransportView />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    tabContainer: { flexDirection: 'row', backgroundColor: COLORS.surface, margin: SIZES.spacing.lg, borderRadius: 12, padding: 4, ...SHADOWS.small },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    activeTab: { backgroundColor: COLORS.primary },
    tabText: { fontSize: SIZES.sm, fontWeight: 'medium', color: COLORS.textSecondary },
    activeTabText: { color: COLORS.white },
    listContent: { paddingHorizontal: SIZES.spacing.lg, paddingBottom: SIZES.spacing.xl },
    scrollContent: { paddingHorizontal: SIZES.spacing.lg, paddingBottom: SIZES.spacing.xl },
    vehicleCard: { marginBottom: SIZES.spacing.md, padding: SIZES.spacing.md },
    vehicleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    vehicleIconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    vehicleInfo: { flex: 1 },
    busNumber: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text },
    regNumber: { fontSize: SIZES.xs, color: COLORS.textSecondary },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    driverInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, borderTopColor: '#F5F5F5', pt: 8, marginTop: 8 },
    driverText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: 'medium' },
    myTransportCard: { padding: SIZES.spacing.lg, marginBottom: SIZES.spacing.xl, backgroundColor: COLORS.surface },
    routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    routeName: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
    busInfo: { fontSize: SIZES.md, color: COLORS.textSecondary },
    seatBadge: { alignItems: 'center', backgroundColor: '#F0F4FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, minWidth: 60 },
    seatLabel: { fontSize: 8, fontWeight: 'bold', color: COLORS.primary, letterSpacing: 1 },
    seatValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
    stopsContainer: { marginLeft: 6 },
    stopItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
    stopDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
    stopConnector: { width: 2, height: 40, backgroundColor: '#EEEEEE', marginLeft: 5, marginVertical: 4 },
    stopInfo: { flex: 1 },
    stopLabel: { fontSize: 10, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
    stopName: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text },
    stopTime: { fontSize: 12, color: COLORS.primary, fontWeight: 'bold', marginTop: 2 },
    sectionTitle: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.spacing.md },
    driverCard: { padding: SIZES.spacing.md },
    crewItem: { flexDirection: 'row', alignItems: 'center' },
    crewAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    crewInfo: { flex: 1 },
    crewName: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text },
    crewRole: { fontSize: 10, color: COLORS.textSecondary, textTransform: 'uppercase' },
    crewPhone: { fontSize: 12, color: COLORS.primary, fontWeight: 'medium', marginTop: 2 },
    callButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontSize: SIZES.md, color: COLORS.textSecondary, marginTop: SIZES.spacing.md },
});

export default TransportScreen;
