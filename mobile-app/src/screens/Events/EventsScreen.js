import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';

const EventsScreen = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get(ENDPOINTS.EVENTS);
            if (response.data.success) {
                setEvents(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchEvents();
    };

    const filteredEvents = events.filter((event) =>
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.event_type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getEventTypeColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'holiday': return '#EF4444';
            case 'exam': return '#8B5CF6';
            case 'activity': return '#10B981';
            case 'meeting': return '#F59E0B';
            default: return COLORS.primary;
        }
    };

    const renderEvent = ({ item }) => {
        const startDate = new Date(item.start_date);
        const day = startDate.getDate();
        const month = startDate.toLocaleDateString('en-US', { month: 'short' });
        const typeColor = getEventTypeColor(item.event_type);

        return (
            <Card style={styles.eventCard}>
                <View style={styles.row}>
                    <View style={[styles.dateBox, { backgroundColor: `${typeColor}15` }]}>
                        <Text style={[styles.dateDay, { color: typeColor }]}>{day}</Text>
                        <Text style={[styles.dateMonth, { color: typeColor }]}>{month}</Text>
                    </View>
                    <View style={styles.eventInfo}>
                        <View style={styles.headerRow}>
                            <Text style={styles.eventTitle}>{item.title}</Text>
                            <View style={[styles.typeBadge, { backgroundColor: `${typeColor}15` }]}>
                                <Text style={[styles.typeText, { color: typeColor }]}>{item.event_type?.toUpperCase() || 'EVENT'}</Text>
                            </View>
                        </View>
                        <Text style={styles.eventTime}>
                            <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} /> {item.start_time || 'All Day'}
                        </Text>
                        <Text style={styles.eventLocation}>
                            <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} /> {item.location || 'School Campus'}
                        </Text>
                        {item.description && (
                            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                        )}
                    </View>
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
                    placeholder="Search events..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={COLORS.textLight}
                />
            </View>

            <FlatList
                data={filteredEvents}
                renderItem={renderEvent}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={64} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>No events found</Text>
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
    searchInput: { flex: 1, paddingVertical: SIZES.spacing.md, paddingHorizontal: SIZES.spacing.sm, fontSize: SIZES.md, color: COLORS.text },
    listContent: { padding: SIZES.spacing.lg, paddingTop: 0 },
    eventCard: { marginBottom: SIZES.spacing.md, padding: SIZES.spacing.md },
    row: { flexDirection: 'row' },
    dateBox: { width: 50, height: 60, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacing.md },
    dateDay: { fontSize: SIZES.lg, fontWeight: 'bold' },
    dateMonth: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    eventInfo: { flex: 1 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
    eventTitle: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text, flex: 1, marginRight: 8 },
    typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    typeText: { fontSize: 8, fontWeight: 'bold' },
    eventTime: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginBottom: 2 },
    eventLocation: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginBottom: 6 },
    description: { fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 18 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SIZES.spacing.xxl },
    emptyText: { fontSize: SIZES.md, color: COLORS.textSecondary, marginTop: SIZES.spacing.md },
});

export default EventsScreen;
