import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';

// Import screens
import LoginScreen from '../screens/Auth/LoginScreen';
import MainNavigator from './MainNavigator';
import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: COLORS.background },
                }}
            >
                {!isAuthenticated ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    <Stack.Screen name="Main" component={MainNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
