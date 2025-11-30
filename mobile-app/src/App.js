import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import * as SecureStore from 'expo-secure-store';
import { store } from './store';
import { loginSuccess } from './store/authSlice';
import AppNavigator from './navigation/AppNavigator';
import LoadingSpinner from './components/LoadingSpinner';

export default function App() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            const userString = await SecureStore.getItemAsync('user');

            if (token && userString) {
                const user = JSON.parse(userString);
                store.dispatch(loginSuccess({ token, user }));
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <Provider store={store}>
            <StatusBar style="light" />
            <AppNavigator />
        </Provider>
    );
}
