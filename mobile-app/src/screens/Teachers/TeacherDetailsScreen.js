import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const TeacherDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const response = await api.get(`/teachers/${id}`);
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

export default TeacherDetailsScreen;
