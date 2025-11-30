const fs = require('fs');
const path = require('path');

const screens = [
    { name: 'Classes', folder: 'Classes', hasDetails: true },
    { name: 'ClassDetails', folder: 'Classes', isDetails: true },
    { name: 'Teachers', folder: 'Teachers', hasDetails: true },
    { name: 'TeacherDetails', folder: 'Teachers', isDetails: true },
    { name: 'Attendance', folder: 'Attendance' },
    { name: 'Exams', folder: 'Exams', hasDetails: true },
    { name: 'ExamDetails', folder: 'Exams', isDetails: true },
    { name: 'Assignments', folder: 'Assignments', hasDetails: true },
    { name: 'AssignmentDetails', folder: 'Assignments', isDetails: true },
    { name: 'FeeManagement', folder: 'Fees' },
    { name: 'Events', folder: 'Events' },
    { name: 'Announcements', folder: 'Announcements', hasDetails: true },
    { name: 'AnnouncementDetails', folder: 'Announcements', isDetails: true },
    { name: 'Messages', folder: 'Messages' },
    { name: 'Profile', folder: 'Profile' },
    { name: 'Schedule', folder: 'Schedule', hasDetails: true },
    { name: 'ScheduleDetails', folder: 'Schedule', isDetails: true },
    { name: 'Subjects', folder: 'Subjects' },
    { name: 'Library', folder: 'Library' },
    { name: 'Hostel', folder: 'Hostel' },
    { name: 'Transport', folder: 'Transport' },
    { name: 'Payroll', folder: 'Payroll' },
];

const createListScreenTemplate = (name, folder) => `import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const ${name}Screen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/${folder.toLowerCase()}');
      if (response.data.success) {
        setItems(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderItem = ({ item }) => (
    <Card onPress={() => navigation.navigate('${name}Details', { id: item.id })} style={styles.card}>
      <Text style={styles.title}>{item.name || item.title || 'Untitled'}</Text>
      <Text style={styles.subtitle}>{item.description || item.class_name || ''}</Text>
    </Card>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textLight}
        />
      </View>
      <FlatList
        data={items.filter(item => 
          (item.name || item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
        )}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items found</Text>
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
  card: { marginBottom: SIZES.spacing.md },
  title: { fontSize: SIZES.md, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.spacing.xs },
  subtitle: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SIZES.spacing.xxl },
  emptyText: { fontSize: SIZES.md, color: COLORS.textSecondary },
});

export default ${name}Screen;
`;

const createDetailsScreenTemplate = (name, folder) => `import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const ${name}Screen = ({ route, navigation }) => {
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const response = await api.get(\`/${folder.toLowerCase()}/\${id}\`);
      if (response.data.success) {
        setItem(response.data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!item) return <View style={styles.container}><Text>Not found</Text></View>;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDetails(); }} />}
    >
      <Card title="Details">
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{item.name || item.title || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.value}>{item.description || 'N/A'}</Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SIZES.spacing.lg },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.spacing.md },
  label: { fontSize: SIZES.base, fontWeight: '600', color: COLORS.textSecondary },
  value: { fontSize: SIZES.base, color: COLORS.text, flex: 1, textAlign: 'right' },
});

export default ${name}Screen;
`;

const createSimpleScreenTemplate = (name) => `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

const ${name}Screen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>${name} Screen</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: SIZES.xl, fontWeight: 'bold', color: COLORS.text },
  subtitle: { fontSize: SIZES.md, color: COLORS.textSecondary, marginTop: SIZES.spacing.sm },
});

export default ${name}Screen;
`;

// Generate all screens
screens.forEach(screen => {
    const folderPath = path.join(__dirname, 'src', 'screens', screen.folder);

    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const fileName = `${screen.name}Screen.js`;
    const filePath = path.join(folderPath, fileName);

    // Skip if file already exists
    if (fs.existsSync(filePath)) {
        console.log(`Skipping ${fileName} (already exists)`);
        return;
    }

    let content;
    if (screen.isDetails) {
        content = createDetailsScreenTemplate(screen.name, screen.folder);
    } else if (screen.hasDetails) {
        content = createListScreenTemplate(screen.name, screen.folder);
    } else {
        content = createSimpleScreenTemplate(screen.name);
    }

    fs.writeFileSync(filePath, content);
    console.log(`Created ${fileName}`);
});

console.log('All screens generated successfully!');
