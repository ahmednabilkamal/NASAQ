import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ServicePackageCardProps {
    title: string;
    subtitle: string;
    price: number;
    currency?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    variant?: 'light' | 'dark';
    onPress?: () => void;
    containerStyle?: StyleProp<ViewStyle>;
}

export default function ServicePackageCard({
    title,
    subtitle,
    price,
    currency = 'ر.س',
    icon = 'arrow-up-outline',
    variant = 'light',
    onPress,
    containerStyle,
}: ServicePackageCardProps) {
    const isDark = variant === 'dark';

    return (
        <TouchableOpacity
            style={[styles.container, containerStyle, isDark ? styles.darkContainer : styles.lightContainer]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {isDark ? (
                <View pointerEvents="none" style={styles.darkRippleWrap}>
                    {[0, 1, 2, 3].map((i) => (
                        <View
                            key={i}
                            style={[
                                styles.darkRippleRing,
                                {
                                    width: 56 + i * 36,
                                    height: 56 + i * 36,
                                    top: -24 + i * 10,
                                    right: -28 - i * 6,
                                },
                            ]}
                        />
                    ))}
                </View>
            ) : null}

            <View style={styles.topRow}>
                <View style={[styles.iconContainer, isDark ? styles.darkIcon : styles.lightIcon]}>
                    <Ionicons
                        name={icon}
                        size={20}
                        color={isDark ? '#064E3B' : '#064E3B'}
                        style={{ transform: [{ rotate: '-45deg' }] }}
                    />
                </View>
                <View style={styles.priceRow}>
                    <Text style={[styles.priceText, isDark && styles.darkText]}>
                        {currency} {price}
                    </Text>
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
        backgroundColor: '#E8F5E9',
    },
    darkContainer: {
        backgroundColor: '#064E3B',
        overflow: 'hidden',
    },
    darkRippleWrap: {
        ...StyleSheet.absoluteFillObject,
    },
    darkRippleRing: {
        position: 'absolute',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
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
        backgroundColor: '#FFF',
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
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 10,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
        textAlign: 'center',
        marginTop: 4,
    },
    darkSubtitle: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
});

