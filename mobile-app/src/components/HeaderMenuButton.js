import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants/theme';

const HeaderMenuButton = ({ color = COLORS.white }) => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.button}
        >
            <Ionicons name="menu-outline" size={28} color={color} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        marginLeft: SIZES.spacing.sm,
        padding: SIZES.spacing.xs,
    },
});

export default HeaderMenuButton;
