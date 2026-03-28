import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/config/authContext';
import apiServiceDefault, { Stylist } from '@/config/apiService';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { defaultStylistFilters, loadStylistFilters } from '@/config/stylistFilters';
import { getBackChevron } from '@/config/directionalIcons';

export default function StylistsScreen() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const navigation = useNavigation<any>();
    const { focusSearch } = useLocalSearchParams<{ focusSearch?: string }>();
    const searchInputRef = useRef<TextInput>(null);
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.stylistsList || (pageData as any)['ar'].stylistsList;

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/pages/login');
        }
    }, [isAuthenticated, authLoading, router]);

    const [search, setSearch] = useState('');
    const [stylists, setStylists] = useState<Stylist[]>([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [filters, setFilters] = useState(defaultStylistFilters);

    const fetchStylists = useCallback(async (searchQuery?: string) => {
        setLoading(true);
        try {
            const res = await apiServiceDefault.getStylists({ per_page: 20, search: searchQuery });
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

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            let t: any;

            const load = async () => {
                const stored = await loadStylistFilters();
                if (!isActive) return;
                setFilters(stored);
            };

            load();

            if (focusSearch === '1') {
                t = setTimeout(() => searchInputRef.current?.focus(), 200);
            }

            return () => {
                isActive = false;
                if (t) clearTimeout(t);
            };
        }, [focusSearch])
    );

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStylists(search.trim() || undefined);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, fetchStylists]);

    const filteredStylists = useMemo(() => {
        const styleSet = new Set(filters.selectedStyleIds);
        const styleFilterActive = styleSet.size > 0;
        const priceFilterActive =
            filters.minPrice !== defaultStylistFilters.minPrice ||
            filters.maxPrice !== defaultStylistFilters.maxPrice;

        const toNumber = (value: unknown): number | null => {
            if (value == null) return null;
            const n = Number(value);
            return Number.isFinite(n) ? n : null;
        };

        const getServicePrices = (s: any): number[] => {
            const services = Array.isArray(s?.services) ? s.services : [];
            return services
                .map((svc: any) => toNumber(svc?.price))
                .filter((n: number | null): n is number => n != null);
        };

        const matchesPriceRange = (s: any): boolean => {
            const servicePrices = getServicePrices(s);

            // Primary: filter by stylist services prices.
            if (servicePrices.length > 0) {
                return servicePrices.some((p) => p >= filters.minPrice && p <= filters.maxPrice);
            }

            // Fallback: if API doesn't return service prices, try stylist.price.
            const fallbackPrice = toNumber(s?.price);
            if (fallbackPrice == null) return false;
            return fallbackPrice >= filters.minPrice && fallbackPrice <= filters.maxPrice;
        };

        return stylists.filter((s: any) => {
            if (priceFilterActive) {
                if (!matchesPriceRange(s)) return false;
            }

            if (styleFilterActive) {
                const hasMatch = (s.fashion_styles ?? []).some((fs: any) => {
                    const name = String(fs?.name ?? '');
                    const id = fs?.id != null ? String(fs.id) : '';
                    return styleSet.has(name) || styleSet.has(id);
                });
                if (!hasMatch) return false;
            }

            return true;
        });
    }, [stylists, filters]);

    const handleBack = () => {
        if (navigation?.canGoBack?.() === true) {
            router.back();
            return;
        }
        router.replace('/pages/tabs/homescreen' as any);
    };

    const toggleFavorite = (id: string) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const StylistCard = ({ item }: { item: Stylist }) => {
        const id = String(item.id);
        const isFav = favorites.includes(id);
        const tags = item.fashion_styles?.map((s: any) => s.name) ?? [];
        const height = item?.height != null && item?.height !== '' ? `${item.height} cm` : null;
        const weight = item?.weight != null && item?.weight !== '' ? `${item.weight} kg` : null;

        const handleFavoritePress = (e: any) => {
            // Prevent card press when toggling favorite
            e?.stopPropagation?.();
            toggleFavorite(id);
        };

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push({ pathname: '/pages/stylist_detail', params: { id } } as any)}
            >
                <View style={styles.imageWrap}>
                    <Image
                        source={item.image ? { uri: item.image } : require('@/assets/mirroimagewomen.png')}
                        style={styles.stylistImage}
                    />
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={handleFavoritePress}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={isFav ? 'heart' : 'heart-outline'}
                            size={20}
                            color={isFav ? '#E11D48' : '#999'}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.stylistName}>{item.name}</Text>

                    <Text style={styles.stylistSpecialty} numberOfLines={1}>
                        {tags.join(' | ') || item.bio || ''}
                    </Text>

                    {(height || weight) && (
                        <Text style={styles.stylistMetrics} numberOfLines={1}>
                            {[height ? `H: ${height}` : null, weight ? `W: ${weight}` : null].filter(Boolean).join(' | ')}
                        </Text>
                    )}

                    <View style={styles.cardFooter}>
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
            {/* Top Header */}
            <View style={styles.topHeader}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
                    <Ionicons name={getBackChevron()} size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{content.title || 'المنسقات'}</Text>
                <View style={styles.headerRightSpacer} />
            </View>

            {/* Search Section */}
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color="#999" />
                    <TextInput
                        ref={searchInputRef}
                        style={styles.searchInput}
                        placeholder={content.searchPlaceholder || 'بحث'}
                        placeholderTextColor="#999"
                        value={search}
                        onChangeText={setSearch}
                        textAlign="right"
                    />
                </View>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={async () => {
                        const q = search.trim() || undefined;
                        fetchStylists(q);
                        router.push({ pathname: '/pages/stylists/filter', params: { q: q ?? '' } } as any);
                    }}
                >
                    <Ionicons name="options-outline" size={22} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Stylists List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#064E3B" />
                </View>
            ) : (
                <FlatList
                    data={filteredStylists}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => <StylistCard item={item} />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>لا توجد نتائج</Text>
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
    topHeader: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    headerRightSpacer: {
        width: 40,
        height: 40,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    searchSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 15,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 48,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Cairo_400Regular',
        fontSize: 14,
        color: '#333',
    },
    filterButton: {
        width: 48,
        height: 48,
        backgroundColor: '#FFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        // React Native grid spacing is handled via card width + justifyContent
    },
    card: {
        width: '48%',
        flexDirection: 'column',
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
    },
    imageWrap: {
        position: 'relative',
    },
    stylistImage: {
        width: '100%',
        height: 120,
        resizeMode: 'cover',
    },
    cardContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    stylistName: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
        textAlign: 'right',
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stylistSpecialty: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        textAlign: 'right',
    },
    stylistMetrics: {
        marginTop: 2,
        fontSize: 11,
        fontFamily: 'Cairo_600SemiBold',
        color: '#6B7280',
        textAlign: 'right',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 13,
        fontFamily: 'Cairo_600SemiBold',
        color: '#333',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontFamily: 'Cairo_400Regular',
        fontSize: 16,
        color: '#999',
    },
});
