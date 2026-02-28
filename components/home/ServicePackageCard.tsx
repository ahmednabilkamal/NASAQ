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

export default function ServicePackageCard({
    title,
    subtitle,
    price,
    currency = 'ر.س',
    icon = 'shirt-outline',
    featured = false,
    onPress
}: ServicePackageCardProps) {
    return (
        <TouchableOpacity
            style={[styles.container, featured && styles.featuredContainer]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.leftSection}>
                <View style={[styles.iconContainer, featured && styles.featuredIcon]}>
                    <Ionicons name={icon} size={20} color={featured ? '#fff' : '#064E3B'} />
                </View>
            </View>

            <View style={styles.contentSection}>
                <Text style={[styles.title, featured && styles.featuredTitle]}>{title}</Text>
                <Text style={[styles.subtitle, featured && styles.featuredSubtitle]}>{subtitle}</Text>
            </View>

            <View style={styles.priceSection}>
                <View style={[styles.priceBadge, featured && styles.featuredPriceBadge]}>
                    <Ionicons name="pricetag" size={12} color={featured ? '#064E3B' : '#064E3B'} />
                    <Text style={[styles.priceText, featured && styles.featuredPriceText]}>{price}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    featuredContainer: {
        backgroundColor: '#064E3B',
        borderColor: '#064E3B',
    },
    leftSection: {
        marginLeft: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    featuredIcon: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    contentSection: {
        flex: 1,
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 15,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
        textAlign: 'right',
    },
    featuredTitle: {
        color: '#fff',
    },
    subtitle: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#888',
        textAlign: 'right',
        marginTop: 2,
    },
    featuredSubtitle: {
        color: 'rgba(255,255,255,0.7)',
    },
    priceSection: {
        marginRight: 12,
    },
    priceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    featuredPriceBadge: {
        backgroundColor: '#fff',
    },
    priceText: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
    featuredPriceText: {
        color: '#064E3B',
    },
});
