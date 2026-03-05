import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ServicePackageCardProps {
    title: string;
    subtitle: string;
    price: number;
    currency?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    featured?: boolean;
    onPress?: () => void;
}

interface ServicePackageCardProps {
    title: string;
    subtitle: string;
    price: number;
    currency?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    variant?: 'light' | 'dark';
    onPress?: () => void;
}

export default function ServicePackageCard({
    title,
    subtitle,
    price,
    currency = 'SAR',
    icon = 'arrow-up-outline',
    variant = 'light',
    onPress
}: ServicePackageCardProps) {
    const isDark = variant === 'dark';

    return (
        <TouchableOpacity
            style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.topRow}>
                <View style={[styles.iconContainer, isDark ? styles.darkIcon : styles.lightIcon]}>
                    <Ionicons name={icon} size={20} color={isDark ? '#FFF' : '#064E3B'} style={{ transform: [{ rotate: '45deg' }] }} />
                </View>
                <View style={styles.priceRow}>
                    <Ionicons name="infinite" size={16} color={isDark ? '#FFF' : '#064E3B'} style={{ marginRight: 4 }} />
                    <Text style={[styles.priceText, isDark && styles.darkText]}>{price}</Text>
                </View>
            </View>

            <View style={styles.bottomContent}>
                <Text style={[styles.title, isDark && styles.darkText]}>{title}</Text>
                <Text style={[styles.subtitle, isDark && styles.darkSubtitle]}>{subtitle}</Text>
            </View>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    container: {
        width: '48%',
        aspectRatio: 1,
        borderRadius: 24,
        padding: 16,
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    lightContainer: {
        backgroundColor: '#E8F5E9', // Light mint
    },
    darkContainer: {
        backgroundColor: '#064E3B', // Dark green
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lightIcon: {
        backgroundColor: 'rgba(6, 78, 59, 0.1)',
    },
    darkIcon: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceText: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
    darkText: {
        color: '#FFF',
    },
    bottomContent: {
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
        textAlign: 'right',
    },
    subtitle: {
        fontSize: 10,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
        textAlign: 'right',
        marginTop: 4,
    },
    darkSubtitle: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
});

