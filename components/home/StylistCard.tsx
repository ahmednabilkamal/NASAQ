import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, IconSizes } from '@/utils/spacing';
import { FontSizes } from '@/utils/typography';

interface StylistCardProps {
    name: string;
    subtitle?: string;
    imageUri?: any;
    rating: number;
    clientCount: number;
    price?: number | string;
    tags: string[];
    onPress?: () => void;
    isFavorite?: boolean;
    onFavoriteToggle?: () => void;
}

export default function StylistCard({ name, subtitle, imageUri, rating, clientCount, price, tags, onPress, isFavorite = false, onFavoriteToggle }: StylistCardProps) {

    const handleFavoritePress = (e: any) => {
        e.stopPropagation();
        onFavoriteToggle?.();
    };

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.imageContainer}>
                {imageUri ? (
                    <Image source={imageUri} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="person" size={IconSizes.xl} color="#ccc" />
                    </View>
                )}
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={scale(10)} color="#FFB800" />
                    <Text style={styles.ratingText}>{rating}</Text>
                </View>
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={handleFavoritePress}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={IconSizes.sm}
                        color={isFavorite ? "#FF4458" : "#999"}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1}>{name}</Text>
                <Text style={styles.tags} numberOfLines={1}>
                    {subtitle || (tags.length > 0 ? tags[0] : 'Expert Stylist')}
                </Text>

                <View style={styles.statsRow}>
                    <View style={styles.clientCount}>
                        <Text style={styles.totalLabel}>Total </Text>
                        <Text style={styles.clientCountText}>{clientCount}</Text>
                    </View>
                    {price && (
                        <Text style={styles.clientCountText}>SAR {price}</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    container: {
        width: scale(170),
        backgroundColor: '#fff',
        borderRadius: BorderRadius.xl,
        marginRight: Spacing.lg,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    imageContainer: {
        width: '100%',
        height: scaleVertical(160),
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ratingBadge: {
        position: 'absolute',
        bottom: scale(10),
        left: scale(10),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: scale(4),
        borderRadius: BorderRadius.md,
        gap: scale(4),
    },
    ratingText: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_600SemiBold',
        color: '#FFF',
    },
    favoriteButton: {
        position: 'absolute',
        top: scale(10),
        right: scale(10),
        width: scale(32),
        height: scale(32),
        borderRadius: BorderRadius.lg,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        padding: Spacing.md,
    },
    name: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        textAlign: 'right',
    },
    tags: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
        textAlign: 'right',
        marginTop: scale(2),
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: scale(10),
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: Spacing.sm,
    },
    clientCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    clientCountText: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_600SemiBold',
        color: '#888',
    },
    totalLabel: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
    }
});

