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

const StudentsScreen = ({ navigation }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await api.get(ENDPOINTS.STUDENTS);
            if (response.data.success) {
                setStudents(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchStudents();
    };

    const filteredStudents = students.filter((student) =>
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.roll_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderStudent = ({ item }) => (
        <Card
            onPress={() => navigation.navigate('StudentDetails', { id: item.id })}
            style={styles.studentCard}
        >
            <View style={styles.studentHeader}>
                <View style={styles.avatarContainer}>
                    {item.profile_image ? (
                        <Image source={{ uri: item.profile_image }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {item.name?.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Text style={styles.studentDetail}>Roll No: {item.roll_number}</Text>
                    <Text style={styles.studentDetail}>Class: {item.class_name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
            </View>
        </Card>
    );

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search students..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={COLORS.textLight}
                />
            </View>

            {/* Students List */}
            <FlatList
                data={filteredStudents}
                renderItem={renderStudent}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>No students found</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
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
    listContent: {
        padding: SIZES.spacing.lg,
        paddingTop: 0,
    },
    studentCard: {
        marginBottom: SIZES.spacing.md,
    },
    studentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: SIZES.spacing.md,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: SIZES.md,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SIZES.spacing.xs,
    },
    studentDetail: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SIZES.spacing.xxl,
    },
    emptyText: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        marginTop: SIZES.spacing.md,
    },
});

export default StudentsScreen;
