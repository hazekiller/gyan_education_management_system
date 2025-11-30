#!/bin/bash

# Script to generate all screen files for the mobile app

# Create all the screen files with basic templates

# Classes
cat > src/screens/Classes/ClassesScreen.js << 'EOF'
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';

const ClassesScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get(ENDPOINTS.CLASSES);
      if (response.data.success) {
        setClasses(response.data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderClass = ({ item }) => (
    <Card onPress={() => navigation.navigate('ClassDetails', { id: item.id })}>
      <Text style={styles.className}>{item.name}</Text>
      <Text style={styles.classDetail}>Students: {item.student_count || 0}</Text>
    </Card>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={classes}
        renderItem={renderClass}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchClasses(); }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SIZES.spacing.lg },
  className: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.text },
  classDetail: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: SIZES.spacing.xs },
});

export default ClassesScreen;
EOF

echo "Generated ClassesScreen.js"

# Continue with other screens...
# I'll create a comprehensive generation script

