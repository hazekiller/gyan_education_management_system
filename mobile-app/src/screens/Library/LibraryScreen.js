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

const LibraryScreen = () => {
    const [activeTab, setActiveTab] = useState('inventory');
    const [books, setBooks] = useState([]);
    const [myBooks, setMyBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'inventory') {
                const response = await api.get(ENDPOINTS.LIBRARY_BOOKS);
                if (response.data.success) {
                    setBooks(response.data.data);
                }
            } else {
                const response = await api.get(ENDPOINTS.LIBRARY_MY_BOOKS);
                if (response.data.success) {
                    setMyBooks(response.data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching library data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const filteredBooks = books.filter((item) =>
        item.book_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderBookItem = ({ item }) => (
        <Card style={styles.bookCard}>
            <View style={styles.bookHeader}>
                <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle}>{item.book_title}</Text>
                    <Text style={styles.bookAuthor}>{item.author}</Text>
                    <View style={styles.tagContainer}>
                        <View style={styles.categoryTag}>
                            <Text style={styles.tagText}>{item.category}</Text>
                        </View>
                        {item.rack_number && (
                            <View style={styles.rackTag}>
                                <Text style={styles.tagText}>Rack {item.rack_number}</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={[styles.availabilityBadge, { backgroundColor: item.available_copies > 0 ? '#E8F5E9' : '#FFEBEE' }]}>
                    <Text style={[styles.availabilityText, { color: item.available_copies > 0 ? '#2E7D32' : '#C62828' }]}>
                        {item.available_copies > 0 ? `${item.available_copies} Avail` : 'Out'}
                    </Text>
                </View>
            </View>
        </Card>
    );

    const renderMyBookItem = ({ item }) => (
        <Card style={styles.bookCard}>
            <View style={styles.bookHeader}>
                <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle}>{item.book_title}</Text>
                    <View style={styles.dueDateRow}>
                        <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.dueDateText}>Due: {new Date(item.due_date).toLocaleDateString()}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'issued' ? '#E3F2FD' : '#E8F5E9' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'issued' ? '#1976D2' : '#2E7D32' }]}>
                        {item.status?.toUpperCase()}
                    </Text>
                </View>
            </View>
        </Card>
    );

    return (
        <View style={styles.container}>
            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'inventory' && styles.activeTab]}
                    onPress={() => setActiveTab('inventory')}
                >
                    <Text style={[styles.tabText, activeTab === 'inventory' && styles.activeTabText]}>Inventory</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'my-books' && styles.activeTab]}
                    onPress={() => setActiveTab('my-books')}
                >
                    <Text style={[styles.tabText, activeTab === 'my-books' && styles.activeTabText]}>My Books</Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            {activeTab === 'inventory' && (
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={COLORS.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by title, author, or category..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={COLORS.textLight}
                    />
                </View>
            )}

            {loading ? (
                <LoadingSpinner />
            ) : (
                <FlatList
                    data={activeTab === 'inventory' ? filteredBooks : myBooks}
                    renderItem={activeTab === 'inventory' ? renderBookItem : renderMyBookItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="book-outline" size={64} color={COLORS.textLight} />
                            <Text style={styles.emptyText}>
                                {activeTab === 'inventory' ? 'No books found' : 'You have no borrowed books'}
                            </Text>
                        </View>
                    }
                />
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
    bookCard: { marginBottom: SIZES.spacing.md, padding: SIZES.spacing.md },
    bookHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    bookInfo: { flex: 1, marginRight: SIZES.spacing.md },
    bookTitle: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text },
    bookAuthor: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
    tagContainer: { flexDirection: 'row', marginTop: 8, gap: 6 },
    categoryTag: { backgroundColor: '#F0F4FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    rackTag: { backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    tagText: { fontSize: 10, color: COLORS.textSecondary, fontWeight: 'bold' },
    availabilityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    availabilityText: { fontSize: 10, fontWeight: 'bold' },
    dueDateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    dueDateText: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginLeft: 4 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SIZES.spacing.xxl },
    emptyText: { fontSize: SIZES.md, color: COLORS.textSecondary, marginTop: SIZES.spacing.md },
});

export default LibraryScreen;
