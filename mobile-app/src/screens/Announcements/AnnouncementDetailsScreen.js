import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';

const AnnouncementDetailsScreen = ({ route, navigation }) => {
    const { id } = route.params;
    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAnnouncementDetails();
    }, [id]);

    const fetchAnnouncementDetails = async () => {
        try {
            const response = await api.get(ENDPOINTS.ANNOUNCEMENT_DETAILS(id));
            if (response.data.success) {
                setAnnouncement(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching announcement details:', error);
            Alert.alert('Error', 'Failed to fetch announcement details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnnouncementDetails();
    };

    if (loading) return <LoadingSpinner />;
    if (!announcement) return (
        <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Announcement not found</Text>
        </View>
    );

    const getPriorityStyles = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'urgent': return { color: '#EF4444', bg: '#FEE2E2' };
            case 'high': return { color: '#F97316', bg: '#FFEDD5' };
            default: return { color: COLORS.primary, bg: '#E0E7FF' };
        }
    };

    const pStyles = getPriorityStyles(announcement.priority);

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <View style={styles.badgeRow}>
                    <View style={[styles.priorityBadge, { backgroundColor: pStyles.bg }]}>
                        <Text style={[styles.priorityText, { color: pStyles.color }]}>
                            {announcement.priority?.toUpperCase()} PRIORITY
                        </Text>
                    </View>
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateText}>
                            {new Date(announcement.published_at || announcement.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                    </View>
                </View>
                <Text style={styles.title}>{announcement.title}</Text>
                <View style={styles.publisherRow}>
                    <View style={styles.publisherAvatar}>
                        <Ionicons name="person" size={16} color={COLORS.white} />
                    </View>
                    <View>
                        <Text style={styles.publisherName}>{announcement.created_by_name}</Text>
                        <Text style={styles.publisherRole}>Published by Staff</Text>
                    </View>
                </View>
            </View>

            <Card style={styles.contentCard}>
                <Ionicons name="megaphone-outline" size={24} color={COLORS.primary} style={styles.megaIcon} />
                <Text style={styles.contentText}>{announcement.content}</Text>
            </Card>

            {(announcement.class_name || announcement.target_audience) && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Target Audience</Text>
                    <View style={styles.targetRow}>
                        <View style={styles.targetItem}>
                            <Ionicons name="people-outline" size={18} color={COLORS.textSecondary} />
                            <Text style={styles.targetText}>Audience: {announcement.target_audience?.toUpperCase() || 'ALL'}</Text>
                        </View>
                        {announcement.class_name && (
                            <View style={styles.targetItem}>
                                <Ionicons name="school-outline" size={18} color={COLORS.textSecondary} />
                                <Text style={styles.targetText}>Class: {announcement.class_name}</Text>
                            </View>
                        )}
                    </View>
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
    header: { marginBottom: SIZES.spacing.xl },
    badgeRow: { flexDirection: 'row', gap: 8, marginBottom: SIZES.spacing.md },
    priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    priorityText: { fontSize: 10, fontWeight: 'bold' },
    dateBadge: { backgroundColor: '#F5F5F5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    dateText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'medium' },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.spacing.lg },
    publisherRow: { flexDirection: 'row', alignItems: 'center', padding: 4 },
    publisherAvatar: { 
        width: 36, 
        height: 36, 
        borderRadius: 18, 
        backgroundColor: COLORS.primary, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 12 
    },
    publisherName: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text },
    publisherRole: { fontSize: 10, color: COLORS.textSecondary },
    contentCard: { padding: SIZES.spacing.lg, position: 'relative' },
    megaIcon: { position: 'absolute', top: -12, right: 12, opacity: 0.1 },
    contentText: { fontSize: SIZES.md, color: COLORS.text, lineHeight: 26 },
    section: { marginTop: SIZES.spacing.xl },
    sectionTitle: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.spacing.sm },
    targetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    targetItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F9FAFB', padding: 8, borderRadius: 8 },
    targetText: { fontSize: 12, color: COLORS.textSecondary },
});

export default AnnouncementDetailsScreen;
