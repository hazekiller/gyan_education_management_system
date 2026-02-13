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

const HostelScreen = () => {
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState(user?.role === 'student' ? 'my-room' : 'rooms');
    const [rooms, setRooms] = useState([]);
    const [myRoom, setMyRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const isAdmin = ['super_admin', 'admin', 'principal'].includes(user?.role);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'rooms') {
                const response = await api.get(ENDPOINTS.HOSTEL_ROOMS);
                if (response.data.success) {
                    setRooms(response.data.data);
                }
            } else {
                const response = await api.get(ENDPOINTS.HOSTEL_MY_ROOM);
                if (response.data.success) {
                    setMyRoom(response.data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching hostel data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const renderRoomItem = ({ item }) => (
        <Card style={styles.roomCard}>
            <View style={styles.roomHeader}>
                <View style={styles.roomIconContainer}>
                    <Ionicons name="bed-outline" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.roomInfo}>
                    <Text style={styles.roomNumber}>Room {item.room_number}</Text>
                    <Text style={styles.buildingName}>{item.building_name}</Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: item.type === 'male' ? '#E3F2FD' : '#FCE4EC' }]}>
                    <Text style={[styles.typeText, { color: item.type === 'male' ? '#1976D2' : '#C2185B' }]}>
                        {item.type?.toUpperCase()}
                    </Text>
                </View>
            </View>
            <View style={styles.vacancyRow}>
                <View style={styles.occupancyBar}>
                    <View 
                        style={[
                            styles.occupancyFill, 
                            { width: `${(item.current_occupancy / item.capacity) * 100}%`, backgroundColor: item.current_occupancy >= item.capacity ? COLORS.error : COLORS.primary }
                        ]} 
                    />
                </View>
                <Text style={styles.occupancyText}>
                    {item.current_occupancy}/{item.capacity} Occupied
                </Text>
            </View>
        </Card>
    );

    const MyRoomView = () => {
        if (!myRoom) return (
            <View style={styles.emptyContainer}>
                <Ionicons name="home-outline" size={64} color={COLORS.textLight} />
                <Text style={styles.emptyText}>No room allocated yet</Text>
            </View>
        );

        const { allocation, partners } = myRoom;

        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <Card style={styles.myRoomCard}>
                    <View style={styles.myRoomHeader}>
                        <View>
                            <Text style={styles.myRoomTitle}>Room {allocation.room_number}</Text>
                            <Text style={styles.myBuildingName}>{allocation.building_name}</Text>
                        </View>
                        <View style={styles.allocationBadge}>
                            <Text style={styles.allocationDateText}>
                                Since: {new Date(allocation.allocation_date).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                    
                    <View style={styles.myRoomDetails}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Type</Text>
                            <Text style={styles.detailValue}>{allocation.type?.toUpperCase()} Hostel</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Status</Text>
                            <Text style={[styles.detailValue, { color: '#2E7D32' }]}>Active</Text>
                        </View>
                    </View>
                </Card>

                <Text style={styles.sectionTitle}>Room Partners</Text>
                {partners && partners.length > 0 ? (
                    partners.map((partner, index) => (
                        <Card key={index} style={styles.partnerCard}>
                            <View style={styles.partnerInfo}>
                                <View style={styles.partnerAvatar}>
                                    <Text style={styles.partnerAvatarText}>{partner.first_name?.[0]}</Text>
                                </View>
                                <View>
                                    <Text style={styles.partnerName}>{partner.first_name} {partner.last_name}</Text>
                                    <Text style={styles.partnerClass}>Class {partner.class_id}</Text>
                                </View>
                            </View>
                        </Card>
                    ))
                ) : (
                    <Text style={styles.noPartnersText}>No other occupants in this room</Text>
                )}
            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            {/* Tabs (only for Admin/Staff) */}
            {isAdmin && (
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'rooms' && styles.activeTab]}
                        onPress={() => setActiveTab('rooms')}
                    >
                        <Text style={[styles.tabText, activeTab === 'rooms' && styles.activeTabText]}>Rooms</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'my-room' && styles.activeTab]}
                        onPress={() => setActiveTab('my-room')}
                    >
                        <Text style={[styles.tabText, activeTab === 'my-room' && styles.activeTabText]}>My Room</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading ? (
                <LoadingSpinner />
            ) : activeTab === 'rooms' ? (
                <FlatList
                    data={rooms}
                    renderItem={renderRoomItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="bed-outline" size={64} color={COLORS.textLight} />
                            <Text style={styles.emptyText}>No rooms found</Text>
                        </View>
                    }
                />
            ) : (
                <MyRoomView />
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
    roomCard: { marginBottom: SIZES.spacing.md, padding: SIZES.spacing.md },
    roomHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    roomIconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    roomInfo: { flex: 1 },
    roomNumber: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text },
    buildingName: { fontSize: SIZES.xs, color: COLORS.textSecondary },
    typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    typeText: { fontSize: 10, fontWeight: 'bold' },
    vacancyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    occupancyBar: { flex: 1, height: 8, backgroundColor: '#F5F5F5', borderRadius: 4, overflow: 'hidden' },
    occupancyFill: { height: '100%' },
    occupancyText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: 'medium' },
    myRoomCard: { padding: SIZES.spacing.lg, marginBottom: SIZES.spacing.xl, backgroundColor: COLORS.surface },
    myRoomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    myRoomTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
    myBuildingName: { fontSize: SIZES.md, color: COLORS.textSecondary },
    allocationBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    allocationDateText: { fontSize: SIZES.xs, color: '#2E7D32', fontWeight: 'bold' },
    myRoomDetails: { flexDirection: 'row', gap: 20 },
    detailItem: { flex: 1, backgroundColor: '#F8F9FE', padding: 12, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
    detailLabel: { fontSize: 10, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
    detailValue: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text, marginTop: 4 },
    sectionTitle: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.spacing.md },
    partnerCard: { padding: SIZES.spacing.md, marginBottom: SIZES.spacing.sm },
    partnerInfo: { flexDirection: 'row', alignItems: 'center' },
    partnerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    partnerAvatarText: { color: COLORS.white, fontWeight: 'bold', fontSize: 18 },
    partnerName: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text },
    partnerClass: { fontSize: SIZES.xs, color: COLORS.textSecondary },
    noPartnersText: { fontSize: SIZES.sm, color: COLORS.textSecondary, fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontSize: SIZES.md, color: COLORS.textSecondary, marginTop: SIZES.spacing.md },
});

export default HostelScreen;
