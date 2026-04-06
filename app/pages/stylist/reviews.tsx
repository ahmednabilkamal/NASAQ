import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { stylistScreenDirection } from '@/config/rtlLayout';
import { rtlText } from '@/config/rtlText';
import { Ionicons } from '@expo/vector-icons';
import apiService, { StylistReview } from '@/config/apiService';
import { entityToImageSource } from '@/utils/resolveMediaUrl';

function clampRating(raw: unknown): number {
    const n = Math.round(Number(raw ?? 0));
    if (!Number.isFinite(n)) return 0;
    return Math.min(5, Math.max(0, n));
}

export default function StylistReviewsScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [reviews, setReviews] = useState<StylistReview[]>([]);

    const load = useCallback(async () => {
        try {
            const profileRes = await apiService.getStylistProfile();
            const profile = (profileRes as any)?.data ?? profileRes;
            const stylistId = profile?.id;
            if (!stylistId) {
                setReviews([]);
                return;
            }

            const detailsRes = await apiService.getStylistById(stylistId);
            const details = (detailsRes as any)?.data ?? detailsRes;
            const list = Array.isArray(details?.reviews) ? (details.reviews as StylistReview[]) : [];
            setReviews(list);
        } catch (e) {
            console.error('Stylist reviews load error:', e);
            setReviews([]);
        }
    }, []);

    useEffect(() => {
        (async () => {
            setLoading(true);
            await load();
            setLoading(false);
        })();
    }, [load]);

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    const renderStars = (rating: unknown) => {
        const r = clampRating(rating);
        return (
            <View style={styles.starsRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <Ionicons
                        key={`st-${i}`}
                        name={i < r ? 'star' : 'star-outline'}
                        size={18}
                        color="#F59E0B"
                    />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, stylistScreenDirection]} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>التقييمات</Text>
            </View>

            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color="#064E3B" />
                </View>
            ) : (
                <FlatList
                    data={reviews}
                    keyExtractor={(r) => String(r.id)}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#064E3B" />}
                    ListEmptyComponent={<Text style={styles.emptyText}>لا توجد تقييمات حالياً</Text>}
                    renderItem={({ item }) => {
                        const imgSrc = entityToImageSource(item.user as any);
                        const body = item.review || item.comment || '';
                        return (
                            <View style={styles.card}>
                                <View style={styles.topRow}>
                                    <View style={styles.avatarWrap}>
                                        {imgSrc ? (
                                            <Image source={imgSrc} style={styles.avatar} />
                                        ) : (
                                            <View style={styles.avatarFallback}>
                                                <Ionicons name="person" size={18} color="#9CA3AF" />
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.nameAndStars}>
                                        <Text style={styles.name} numberOfLines={1}>
                                            {item.user?.name || 'مستخدمة'}
                                        </Text>
                                        {renderStars(item.rating)}
                                    </View>
                                </View>

                                {body ? (
                                    <Text style={styles.body}>
                                        {'\u201c'}
                                        {body}
                                        {'\u201d'}
                                    </Text>
                                ) : null}
                            </View>
                        );
                    }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 10,
        backgroundColor: '#F8F9FA',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        ...rtlText.alignStart,
    },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10, gap: 12 },
    emptyText: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        paddingTop: 40,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F3F4F6',
    },
    avatar: { width: '100%', height: '100%', resizeMode: 'cover' },
    avatarFallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    nameAndStars: { flex: 1, minWidth: 0 },
    name: {
        fontSize: 15,
        fontFamily: 'Cairo_700Bold',
        color: '#111827',
        ...rtlText.alignStart,
    },
    starsRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
    body: {
        marginTop: 10,
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#6B7280',
        lineHeight: 22,
        ...rtlText.alignStart,
    },
});

