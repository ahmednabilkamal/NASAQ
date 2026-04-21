import { HomeFeedReview } from '@/config/apiService';
import { rtlText } from '@/config/rtlText';
import { pickResolvedEntityImageUrl } from '@/utils/resolveMediaUrl';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';

interface HomeReviewsSectionProps {
    reviews: HomeFeedReview[];
}

function renderStars(rawRating: unknown) {
    const n = Math.round(Number(rawRating ?? 0));
    const rating = Number.isFinite(n) ? Math.min(5, Math.max(0, n)) : 0;
    return (
        <View style={styles.starsRow}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons key={`hr-${i}`} name={i < rating ? 'star' : 'star-outline'} size={14} color="#F59E0B" />
            ))}
        </View>
    );
}

export default function HomeReviewsSection({ reviews }: HomeReviewsSectionProps) {
    if (!reviews.length) {
        return null;
    }

    const renderItem = ({ item }: { item: HomeFeedReview }) => {
        const body = (item.review || item.comment || '').trim() || 'تجربة ممتازة';
        const userName = item.user?.name?.trim() || 'عميلة';
        const avatarUri = pickResolvedEntityImageUrl(item.user as Record<string, unknown> | undefined);
        return (
            <View style={styles.card}>
                <View style={styles.cardTop}>
                    <View style={styles.avatarWrap}>
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarFallback]}>
                                <Ionicons name="person" size={22} color="#9CA3AF" />
                            </View>
                        )}
                    </View>
                    <View style={styles.meta}>
                        <Text style={styles.authorName} numberOfLines={1}>
                            {userName}
                        </Text>
                        {renderStars(item.rating)}
                    </View>
                </View>
                <Text style={styles.body} numberOfLines={4}>
                    {body}
                </Text>
            </View>
        );
    };

    return (
        <FlatList
            data={reviews}
            horizontal
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={renderItem}
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: 20,
        gap: 12,
        paddingBottom: 4,
    },
    card: {
        width: 268,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#EEF0F4',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarWrap: {
        marginEnd: 10,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    avatarFallback: {
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    meta: {
        flex: 1,
        minWidth: 0,
    },
    authorName: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#111827',
        marginBottom: 4,
        ...rtlText.alignStart,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
        alignItems: 'center',
    },
    body: {
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#4B5563',
        lineHeight: 20,
        ...rtlText.alignStart,
    },
});
