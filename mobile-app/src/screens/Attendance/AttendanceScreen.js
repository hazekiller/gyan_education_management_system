import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

const AttendanceScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Attendance Screen</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: SIZES.xl, fontWeight: 'bold', color: COLORS.text },
  subtitle: { fontSize: SIZES.md, color: COLORS.textSecondary, marginTop: SIZES.spacing.sm },
});

export default AttendanceScreen;
