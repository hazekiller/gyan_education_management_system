import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';

const StudentDetailsScreen = ({ route, navigation }) => {
    const { id } = route.params;
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchStudentDetails();
    }, [id]);

    const fetchStudentDetails = async () => {
        try {
            const response = await api.get(ENDPOINTS.STUDENT_DETAILS(id));
            if (response.data.success) {
                setStudent(response.data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!student) return <View style={styles.container}><Text>Student not found</Text></View>;

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStudentDetails(); }} />}
        >
            <Card title="Personal Information">
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Name:</Text>
                    <Text style={styles.value}>{student.name}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Roll Number:</Text>
                    <Text style={styles.value}>{student.roll_number}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Class:</Text>
                    <Text style={styles.value}>{student.class_name}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{student.email}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Phone:</Text>
                    <Text style={styles.value}>{student.phone || 'N/A'}</Text>
                </View>
            </Card>

            <Card title="Academic Information">
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Attendance:</Text>
                    <Text style={styles.value}>{student.attendance_percentage || 0}%</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Performance:</Text>
                    <Text style={styles.value}>{student.average_grade || 'N/A'}</Text>
                </View>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, padding: SIZES.spacing.lg },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.spacing.md },
    label: { fontSize: SIZES.base, fontWeight: '600', color: COLORS.textSecondary },
    value: { fontSize: SIZES.base, color: COLORS.text },
});

export default StudentDetailsScreen;
