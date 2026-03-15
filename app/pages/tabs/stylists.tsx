import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/config/authContext';
import apiService, { Stylist } from '@/config/apiService';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, IconSizes } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    I18nManager,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StylistsScreen() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode] || (pageData as any)['en'];
    const isRTL = I18nManager.isRTL;

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/pages/login');
        }
    }, [isAuthenticated, authLoading]);

    const [search, setSearch] = useState('');
    const [stylists, setStylists] = useState<Stylist[]>([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<string[]>([]);

    const fetchStylists = useCallback(async (searchQuery?: string) => {
        setLoading(true);
        try {
            const res = await apiService.getStylists({ per_page: 20, search: searchQuery });
            const data = res?.data;
            setStylists(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Stylists fetch error:', error);
            setStylists([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStylists();
    }, [fetchStylists]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStylists(search.trim() || undefined);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, fetchStylists]);

    const toggleFavorite = (id: string) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const StylistCard = ({ item }: { item: Stylist }) => {
        const id = String(item.id);
        const isFav = favorites.includes(id);
        const tags = item.fashion_styles?.map((s: any) => s.name) ?? [];

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push({ pathname: '/pages/stylist_detail', params: { id } } as any)}
            >
                <Image
                    source={item.image ? { uri: item.image } : require('@/assets/mirroimagewomen.png')}
                    style={styles.stylistImage}
                />

                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={() => toggleFavorite(id)}
                        >
                            <Ionicons
                                name={isFav ? "heart" : "heart-outline"}
                                size={22}
                                color={isFav ? "#E11D48" : "#999"}
                            />
                        </TouchableOpacity>
                        <Text style={styles.stylistName}>{item.name}</Text>
                    </View>

                    <Text style={styles.stylistSpecialty} numberOfLines={1}>
                        {tags.join(' | ') || item.bio || ''}
                    </Text>

                    <View style={styles.cardFooter}>
                        {item.price != null && (
                            <View style={styles.priceContainer}>
                                <Text style={styles.priceText}>{item.price}</Text>
                                <Text style={styles.currencyText}>{content.common?.currency || 'ر.س'}</Text>
                            </View>
                        )}
                        {item.rating != null && (
                            <View style={styles.ratingContainer}>
                                <Text style={styles.ratingText}>{item.rating}</Text>
                                <Ionicons name="star" size={14} color="#FFD700" />
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{content.stylistsList?.title || 'المنسقات'}</Text>
            </View>

            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color="#999" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={content.stylistsList?.searchPlaceholder || 'بحث'}
                        placeholderTextColor="#999"
                        value={search}
                        onChangeText={setSearch}
                        textAlign="right"
                    />
                </View>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => router.push('/pages/stylists/filter' as any)}
                >
                    <Ionicons name="options-outline" size={22} color="#333" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#064E3B" />
                </View>
            ) : (
                <FlatList
                    data={stylists}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => <StylistCard item={item} />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>{content.common?.noResults || 'لا توجد نتائج'}</Text>
                        </View>
                    }
                />
            )}

            <BottomNav />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingVertical: scaleVertical(15),
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSizes.h1,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    searchSection: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        gap: Spacing.md,
        marginBottom: scaleVertical(15),
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.lg,
        height: scaleVertical(48),
        gap: Spacing.md,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Cairo_400Regular',
        fontSize: FontSizes.body,
        color: '#333',
    },
    filterButton: {
        width: scaleVertical(48),
        height: scaleVertical(48),
        backgroundColor: '#FFF',
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingBottom: scaleVertical(100),
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.md,
        overflow: 'hidden',
    },
    stylistImage: {
        width: scale(100),
        height: scale(100),
        resizeMode: 'cover',
    },
    cardContent: {
        flex: 1,
        padding: Spacing.md,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stylistName: {
        fontSize: FontSizes.bodyLarge,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
    },
    favoriteButton: {
        padding: Spacing.xs,
    },
    stylistSpecialty: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        textAlign: 'right',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    ratingText: {
        fontSize: FontSizes.label,
        fontFamily: 'Cairo_600SemiBold',
        color: '#333',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    priceText: {
        fontSize: FontSizes.bodyLarge,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
    currencyText: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_400Regular',
        color: '#064E3B',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: scaleVertical(60),
    },
    emptyText: {
        fontFamily: 'Cairo_400Regular',
        fontSize: FontSizes.bodyLarge,
        color: '#999',
    },
});
