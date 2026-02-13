import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { COLORS, SIZES } from '../constants/theme';
import { canAccessScreen } from '../utils/rbac';

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
import SubjectListScreen from '../screens/Subjects/SubjectListScreen';
import LibraryScreen from '../screens/Library/LibraryScreen';
import HostelScreen from '../screens/Hostel/HostelScreen';
import TransportScreen from '../screens/Transport/TransportScreen';
import PayrollScreen from '../screens/Payroll/PayrollScreen';
import AdmissionsScreen from '../screens/Admissions/AdmissionsScreen';
import AdmissionDetailsScreen from '../screens/Admissions/AdmissionDetailsScreen';
import DailyReportsScreen from '../screens/Reports/DailyReportsScreen';
import DailyReportDetailsScreen from '../screens/Reports/DailyReportDetailsScreen';
import StaffScreen from '../screens/Staff/StaffScreen';
import StaffDetailsScreen from '../screens/Staff/StaffDetailsScreen';

// ... (Drawer and Stack declarations)

// Custom Drawer
import CustomDrawer from '../components/CustomDrawer';
import HeaderMenuButton from '../components/HeaderMenuButton';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const DEFAULT_STACK_OPTIONS = {
    headerShown: true,
    headerStyle: {
        backgroundColor: COLORS.primary,
    },
    headerTintColor: COLORS.white,
    headerTitleStyle: {
        fontWeight: 'bold',
    },
};

// Stack navigators for nested screens
const DashboardStack = () => (
    <Stack.Navigator screenOptions={DEFAULT_STACK_OPTIONS}>
        <Stack.Screen 
            name="DashboardMain" 
            component={DashboardScreen} 
            options={{ title: 'Dashboard', headerLeft: () => <HeaderMenuButton /> }}
        />
    </Stack.Navigator>
);

const ClassesStack = () => (
    <Stack.Navigator screenOptions={DEFAULT_STACK_OPTIONS}>
        <Stack.Screen 
            name="ClassesList" 
            component={ClassesScreen} 
            options={{ title: 'Classes', headerLeft: () => <HeaderMenuButton /> }}
        />
        <Stack.Screen name="ClassDetails" component={ClassDetailsScreen} options={{ title: 'Class Details' }} />
    </Stack.Navigator>
);

const StudentsStack = () => (
    <Stack.Navigator screenOptions={DEFAULT_STACK_OPTIONS}>
        <Stack.Screen 
            name="StudentsList" 
            component={StudentsScreen} 
            options={{ title: 'Students', headerLeft: () => <HeaderMenuButton /> }}
        />
        <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} options={{ title: 'Student Details' }} />
    </Stack.Navigator>
);

const TeachersStack = () => (
    <Stack.Navigator screenOptions={DEFAULT_STACK_OPTIONS}>
        <Stack.Screen 
            name="TeachersList" 
            component={TeachersScreen} 
            options={{ title: 'Teachers', headerLeft: () => <HeaderMenuButton /> }}
        />
        <Stack.Screen name="TeacherDetails" component={TeacherDetailsScreen} options={{ title: 'Teacher Details' }} />
    </Stack.Navigator>
);

const ExamsStack = () => (
    <Stack.Navigator screenOptions={DEFAULT_STACK_OPTIONS}>
        <Stack.Screen 
            name="ExamsList" 
            component={ExamsScreen} 
            options={{ title: 'Exams', headerLeft: () => <HeaderMenuButton /> }}
        />
        <Stack.Screen name="ExamDetails" component={ExamDetailsScreen} options={{ title: 'Exam Details' }} />
    </Stack.Navigator>
);

const AssignmentsStack = () => (
    <Stack.Navigator screenOptions={DEFAULT_STACK_OPTIONS}>
        <Stack.Screen 
            name="AssignmentsList" 
            component={AssignmentsScreen} 
            options={{ title: 'Assignments', headerLeft: () => <HeaderMenuButton /> }}
        />
        <Stack.Screen name="AssignmentDetails" component={AssignmentDetailsScreen} options={{ title: 'Assignment Details' }} />
    </Stack.Navigator>
);

const AnnouncementsStack = () => (
    <Stack.Navigator screenOptions={DEFAULT_STACK_OPTIONS}>
        <Stack.Screen 
            name="AnnouncementsList" 
            component={AnnouncementsScreen} 
            options={{ title: 'Announcements', headerLeft: () => <HeaderMenuButton /> }}
        />
        <Stack.Screen name="AnnouncementDetails" component={AnnouncementDetailsScreen} options={{ title: 'Announcement Details' }} />
    </Stack.Navigator>
);

const ScheduleStack = () => (
    <Stack.Navigator screenOptions={DEFAULT_STACK_OPTIONS}>
        <Stack.Screen 
            name="ScheduleList" 
            component={ScheduleScreen} 
            options={{ title: 'Schedule', headerLeft: () => <HeaderMenuButton /> }}
        />
        <Stack.Screen name="ScheduleDetails" component={ScheduleDetailsScreen} options={{ title: 'Schedule Details' }} />
    </Stack.Navigator>
);

const AdmissionsStack = () => (
    <Stack.Navigator screenOptions={DEFAULT_STACK_OPTIONS}>
        <Stack.Screen 
            name="AdmissionsList" 
            component={AdmissionsScreen} 
            options={{ title: 'Admissions', headerLeft: () => <HeaderMenuButton /> }}
        />
        <Stack.Screen name="AdmissionDetails" component={AdmissionDetailsScreen} options={{ title: 'Admission Details' }} />
    </Stack.Navigator>
);

const DailyReportsStack = () => (
    <Stack.Navigator screenOptions={DEFAULT_STACK_OPTIONS}>
        <Stack.Screen 
            name="DailyReportsList" 
            component={DailyReportsScreen} 
            options={{ title: 'Daily Reports', headerLeft: () => <HeaderMenuButton /> }}
        />
        <Stack.Screen name="DailyReportDetails" component={DailyReportDetailsScreen} options={{ title: 'Report Details' }} />
    </Stack.Navigator>
);

const StaffStack = () => (
    <Stack.Navigator screenOptions={DEFAULT_STACK_OPTIONS}>
        <Stack.Screen 
            name="StaffList" 
            component={StaffScreen} 
            options={{ title: 'Staff', headerLeft: () => <HeaderMenuButton /> }}
        />
        <Stack.Screen name="StaffDetails" component={StaffDetailsScreen} options={{ title: 'Staff Details' }} />
    </Stack.Navigator>
);

const GenericStack = ({ component, title }) => (
    <Stack.Navigator screenOptions={DEFAULT_STACK_OPTIONS}>
        <Stack.Screen 
            name={`${title}Main`} 
            component={component} 
            options={{ title: title, headerLeft: () => <HeaderMenuButton /> }}
        />
    </Stack.Navigator>
);

const MainNavigator = () => {
    const user = useSelector((state) => state.auth.user);
    const userRole = user?.role;

    const renderScreen = (name, component, options = {}, iconName) => {
        if (!canAccessScreen(userRole, name)) return null;

        return (
            <Drawer.Screen
                key={name}
                name={name}
                component={component}
                options={{
                    ...options,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name={iconName} size={size} color={color} />
                    ),
                }}
            />
        );
    }

    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawer {...props} />}
            screenOptions={{
                headerShown: false,
                drawerActiveTintColor: COLORS.primary,
                drawerInactiveTintColor: COLORS.textSecondary,
                drawerLabelStyle: {
                    fontWeight: '500',
                },
                drawerItemStyle: {
                    borderRadius: SIZES.radius.md,
                    marginHorizontal: SIZES.spacing.sm,
                    marginVertical: 2,
                },
            }}
        >
            {renderScreen('Dashboard', DashboardStack, { title: 'Dashboard' }, 'home-outline')}
            {renderScreen('Admissions', AdmissionsStack, { title: 'Admissions' }, 'file-tray-full-outline')}
            {renderScreen('DailyReports', DailyReportsStack, { title: 'Daily Reports' }, 'document-text-outline')}
            {renderScreen('Classes', ClassesStack, { title: 'Classes' }, 'school-outline')}
            {renderScreen('Subjects', (props) => <GenericStack {...props} component={SubjectListScreen} title="Subjects" />, { title: 'Subjects' }, 'book-outline')}
            {renderScreen('Students', StudentsStack, { title: 'Students' }, 'people-outline')}
            {renderScreen('Teachers', TeachersStack, { title: 'Teachers' }, 'person-outline')}
            {renderScreen('Staff', StaffStack, { title: 'Staff' }, 'people-circle-outline')}
            {renderScreen('Attendance', (props) => <GenericStack {...props} component={AttendanceScreen} title="Attendance" />, { title: 'Attendance' }, 'checkmark-circle-outline')}
            {renderScreen('Exams', ExamsStack, { title: 'Exams' }, 'document-text-outline')}
            {renderScreen('Assignments', AssignmentsStack, { title: 'Assignments' }, 'clipboard-outline')}
            {renderScreen('Fees', (props) => <GenericStack {...props} component={FeeManagementScreen} title="Fee Management" />, { title: 'Fees' }, 'cash-outline')}
            {renderScreen('Events', (props) => <GenericStack {...props} component={EventsScreen} title="Events" />, { title: 'Events' }, 'calendar-outline')}
            {renderScreen('Announcements', AnnouncementsStack, { title: 'Announcements' }, 'megaphone-outline')}
            {renderScreen('Messages', (props) => <GenericStack {...props} component={MessagesScreen} title="Messages" />, { title: 'Messages' }, 'chatbubbles-outline')}
            {renderScreen('Schedule', ScheduleStack, { title: 'Schedule' }, 'time-outline')}
            {renderScreen('Library', (props) => <GenericStack {...props} component={LibraryScreen} title="Library" />, { title: 'Library' }, 'library-outline')}
            {renderScreen('Hostel', (props) => <GenericStack {...props} component={HostelScreen} title="Hostel" />, { title: 'Hostel' }, 'bed-outline')}
            {renderScreen('Transport', (props) => <GenericStack {...props} component={TransportScreen} title="Transport" />, { title: 'Transport' }, 'bus-outline')}
            {renderScreen('Payroll', (props) => <GenericStack {...props} component={PayrollScreen} title="Payroll" />, { title: 'Payroll' }, 'wallet-outline')}
            {renderScreen('Profile', (props) => <GenericStack {...props} component={ProfileScreen} title="Profile" />, { title: 'Profile' }, 'person-circle-outline')}
        </Drawer.Navigator>
    );
};

export default MainNavigator;
