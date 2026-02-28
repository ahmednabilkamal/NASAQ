import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StylistCardProps {
    name: string;
    imageUri?: any;
    rating: number;
    clientCount: number;
    tags: string[];
    onPress?: () => void;
    isFavorite?: boolean;
    onFavoriteToggle?: () => void;
}

export default function StylistCard({ name, imageUri, rating, clientCount, tags, onPress, isFavorite: initialFavorite = false, onFavoriteToggle }: StylistCardProps) {
    const [isFavorite, setIsFavorite] = useState(initialFavorite);

    const handleFavoritePress = (e: any) => {
        e.stopPropagation();
        setIsFavorite(!isFavorite);
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
                    <Text style={styles.ratingText}>{rating}</Text>
                    <Ionicons name="star" size={10} color="#FFD700" />
                </View>
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={handleFavoritePress}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={20}
                        color={isFavorite ? "#FF4458" : "#FFF"}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1}>{name}</Text>

                <Text style={styles.tags} numberOfLines={2}>
                    {tags.join(' | ')}
                </Text>

                <View style={styles.statsRow}>
                    <View style={styles.clientCount}>
                        <Ionicons name="people-outline" size={14} color="#666" />
                        <Text style={styles.clientCountText}>{clientCount}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 140,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginRight: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    imageContainer: {
        width: '100%',
        height: 130,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ratingBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 2,
    },
    ratingText: {
        fontSize: 11,
        fontFamily: 'Cairo_600SemiBold',
        color: '#333',
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        padding: 10,
    },
    name: {
        fontSize: 13,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
        textAlign: 'right',
    },
    tags: {
        fontSize: 10,
        fontFamily: 'Cairo_400Regular',
        color: '#888',
        textAlign: 'right',
        marginTop: 2,
        lineHeight: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 6,
    },
    clientCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    clientCountText: {
        fontSize: 11,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
    },
});
