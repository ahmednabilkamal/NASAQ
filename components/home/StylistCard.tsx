import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { rtlText } from '@/config/rtlText';
import AnimatedFavoriteButton from '@/components/AnimatedFavoriteButton';

interface StylistCardProps {
    name: string;
    subtitle?: string;
    imageUri?: any;
    rating: number;
    clientCount: number;
    tags: string[];
    onPress?: () => void;
    isFavorite?: boolean;
    onFavoriteToggle?: () => void;
}

export default function StylistCard({ name, subtitle, imageUri, rating, clientCount, tags, onPress, isFavorite = false, onFavoriteToggle }: StylistCardProps) {
    const subtitleText =
        subtitle != null && String(subtitle).trim() !== ''
            ? String(subtitle)
            : tags.length > 0 && tags[0] != null && String(tags[0]).trim() !== ''
              ? String(tags[0])
              : 'منسّق أزياء';

    const handleFavoritePress = () => {
        onFavoriteToggle?.();
    };

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.imageContainer}>
                {imageUri ? (
                    <Image source={imageUri} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="person" size={40} color="#ccc" />
                    </View>
                )}
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={10} color="#FFB800" />
                    <Text style={styles.ratingText}>{rating}</Text>
                </View>
                <AnimatedFavoriteButton
                    isFavorite={isFavorite}
                    onPress={handleFavoritePress}
                    size={20}
                    activeColor="#FF4458"
                    inactiveColor="#999"
                    style={styles.favoriteButton}
                />
            </View>

            <View style={styles.infoContainer}>
                {[
                    <Text key="name" style={styles.name} numberOfLines={1}>
                        {name}
                    </Text>,
                    <Text key="tags" style={styles.tags} numberOfLines={1}>
                        {subtitleText}
                    </Text>,
                    <View key="stats" style={styles.statsRow}>
                        <View style={styles.clientCount}>
                            <Text style={styles.totalLabel}>عملاء </Text>
                            <Text style={styles.clientCountText}>{clientCount}</Text>
                        </View>
                    </View>,
                ]}
            </View>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    container: {
        width: 170,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    imageContainer: {
        width: '100%',
        height: 160,
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
        bottom: 10,
        end: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    ratingText: {
        fontSize: 11,
        fontFamily: 'Cairo_600SemiBold',
        color: '#FFF',
        writingDirection: 'ltr',
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        start: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        padding: 12,
    },
    name: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        ...rtlText.alignStart,
    },
    tags: {
        fontSize: 11,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
        marginTop: 2,
        ...rtlText.alignStart,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 8,
    },
    clientCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    clientCountText: {
        fontSize: 11,
        fontFamily: 'Cairo_600SemiBold',
        color: '#888',
        ...rtlText.alignStart,
    },
    totalLabel: {
        fontSize: 11,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        ...rtlText.alignStart,
    }
});

