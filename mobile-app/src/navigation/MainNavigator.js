import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Import screens
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import ClassesScreen from '../screens/Classes/ClassesScreen';
import ClassDetailsScreen from '../screens/Classes/ClassDetailsScreen';
import StudentsScreen from '../screens/Students/StudentsScreen';
import StudentDetailsScreen from '../screens/Students/StudentDetailsScreen';
import TeachersScreen from '../screens/Teachers/TeachersScreen';
import TeacherDetailsScreen from '../screens/Teachers/TeacherDetailsScreen';
import AttendanceScreen from '../screens/Attendance/AttendanceScreen';
import ExamsScreen from '../screens/Exams/ExamsScreen';
import ExamDetailsScreen from '../screens/Exams/ExamDetailsScreen';
import AssignmentsScreen from '../screens/Assignments/AssignmentsScreen';
import AssignmentDetailsScreen from '../screens/Assignments/AssignmentDetailsScreen';
import FeeManagementScreen from '../screens/Fees/FeeManagementScreen';
import EventsScreen from '../screens/Events/EventsScreen';
import AnnouncementsScreen from '../screens/Announcements/AnnouncementsScreen';
import AnnouncementDetailsScreen from '../screens/Announcements/AnnouncementDetailsScreen';
import MessagesScreen from '../screens/Messages/MessagesScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ScheduleScreen from '../screens/Schedule/ScheduleScreen';
import ScheduleDetailsScreen from '../screens/Schedule/ScheduleDetailsScreen';
import SubjectsScreen from '../screens/Subjects/SubjectsScreen';
import LibraryScreen from '../screens/Library/LibraryScreen';
import HostelScreen from '../screens/Hostel/HostelScreen';
import TransportScreen from '../screens/Transport/TransportScreen';
import PayrollScreen from '../screens/Payroll/PayrollScreen';

// Custom Drawer
import CustomDrawer from '../components/CustomDrawer';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Stack navigators for nested screens
const DashboardStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="DashboardMain" component={DashboardScreen} />
    </Stack.Navigator>
);

const ClassesStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ClassesList" component={ClassesScreen} />
        <Stack.Screen name="ClassDetails" component={ClassDetailsScreen} />
    </Stack.Navigator>
);

const StudentsStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="StudentsList" component={StudentsScreen} />
        <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} />
    </Stack.Navigator>
);

const TeachersStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="TeachersList" component={TeachersScreen} />
        <Stack.Screen name="TeacherDetails" component={TeacherDetailsScreen} />
    </Stack.Navigator>
);

const ExamsStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ExamsList" component={ExamsScreen} />
        <Stack.Screen name="ExamDetails" component={ExamDetailsScreen} />
    </Stack.Navigator>
);

const AssignmentsStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AssignmentsList" component={AssignmentsScreen} />
        <Stack.Screen name="AssignmentDetails" component={AssignmentDetailsScreen} />
    </Stack.Navigator>
);

const AnnouncementsStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AnnouncementsList" component={AnnouncementsScreen} />
        <Stack.Screen name="AnnouncementDetails" component={AnnouncementDetailsScreen} />
    </Stack.Navigator>
);

const ScheduleStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ScheduleList" component={ScheduleScreen} />
        <Stack.Screen name="ScheduleDetails" component={ScheduleDetailsScreen} />
    </Stack.Navigator>
);

const MainNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawer {...props} />}
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: COLORS.primary,
                },
                headerTintColor: COLORS.white,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                drawerActiveTintColor: COLORS.primary,
                drawerInactiveTintColor: COLORS.textSecondary,
                drawerLabelStyle: {
                    marginLeft: -20,
                },
            }}
        >
            <Drawer.Screen
                name="Dashboard"
                component={DashboardStack}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Classes"
                component={ClassesStack}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="school-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Subjects"
                component={SubjectsScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="book-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Students"
                component={StudentsStack}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="people-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Teachers"
                component={TeachersStack}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Attendance"
                component={AttendanceScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="checkmark-circle-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Exams"
                component={ExamsStack}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="document-text-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Assignments"
                component={AssignmentsStack}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="clipboard-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Fees"
                component={FeeManagementScreen}
                options={{
                    title: 'Fee Management',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="cash-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Events"
                component={EventsScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Announcements"
                component={AnnouncementsStack}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="megaphone-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Messages"
                component={MessagesScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="chatbubbles-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Schedule"
                component={ScheduleStack}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="time-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Library"
                component={LibraryScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="library-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Hostel"
                component={HostelScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="bed-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Transport"
                component={TransportScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="bus-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Payroll"
                component={PayrollScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="wallet-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="person-circle-outline" size={size} color={color} />
                    ),
                }}
            />
        </Drawer.Navigator>
    );
};

export default MainNavigator;
