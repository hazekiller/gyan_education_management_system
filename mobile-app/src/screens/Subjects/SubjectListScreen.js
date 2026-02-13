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

const SubjectListScreen = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await api.get(ENDPOINTS.SUBJECTS);
            if (response.data.success) {
                setSubjects(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchSubjects();
    };

    const filteredSubjects = subjects.filter((subject) =>
        subject.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderSubject = ({ item }) => (
        <Card style={styles.subjectCard}>
            <View style={styles.cardHeader}>
                <View style={[styles.subjectIcon, { backgroundColor: item.subject_nature === 'compulsory' ? '#F0F4FF' : '#FFF7ED' }]}>
                    <Ionicons 
                        name="book" 
                        size={24} 
                        color={item.subject_nature === 'compulsory' ? COLORS.primary : '#F97316'} 
                    />
                </View>
                <View style={styles.subjectInfo}>
                    <Text style={styles.subjectName}>{item.name}</Text>
                    <Text style={styles.subjectCode}>{item.code}</Text>
                </View>
                <View style={[styles.natureBadge, { backgroundColor: item.subject_nature === 'compulsory' ? '#E0E7FF' : '#FFEDD5' }]}>
                    <Text style={[styles.natureText, { color: item.subject_nature === 'compulsory' ? COLORS.primary : '#C2410C' }]}>
                        {item.subject_nature?.toUpperCase() || 'COMPULSORY'}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.teacherRow}>
                <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.teacherLabel}>Teachers:</Text>
                <Text style={styles.teacherNames} numberOfLines={1}>
                    {item.teacher_names || 'Not Assigned'}
                </Text>
            </View>
        </Card>
    );

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search subjects..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={COLORS.textLight}
                />
            </View>

            <FlatList
                data={filteredSubjects}
                renderItem={renderSubject}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="book-outline" size={64} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>No subjects found</Text>
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
    subjectCard: { marginBottom: SIZES.spacing.md, padding: SIZES.spacing.md },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    subjectIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacing.md },
    subjectInfo: { flex: 1 },
    subjectName: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text },
    subjectCode: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
    natureBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    natureText: { fontSize: 10, fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: SIZES.spacing.md },
    teacherRow: { flexDirection: 'row', alignItems: 'center' },
    teacherLabel: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginLeft: 6, marginRight: 4 },
    teacherNames: { fontSize: SIZES.sm, fontWeight: 'medium', color: COLORS.text, flex: 1 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SIZES.spacing.xxl },
    emptyText: { fontSize: SIZES.md, color: COLORS.textSecondary, marginTop: SIZES.spacing.md },
});

export default SubjectListScreen;
