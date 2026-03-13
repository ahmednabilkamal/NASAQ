import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/config/authContext';
import apiService, { Stylist } from '@/config/apiService';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
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
    const content = (pageData as any)[languageCode]?.stylistsList || (pageData as any)['en'].stylistsList;
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

    // Debounced search
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
                                <Text style={styles.currencyText}>ر.س</Text>
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
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{content.title || 'المنسقات'}</Text>
            </View>

            {/* Search Section */}
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color="#999" />
                    <TextInput
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
                    onPress={() => router.push('/pages/stylists/filter' as any)}
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
                    data={stylists}
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
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'center',
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
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
    },
    stylistImage: {
        width: 100,
        height: 100,
        resizeMode: 'cover',
    },
    cardContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stylistName: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
    },
    favoriteButton: {
        padding: 4,
    },
    stylistSpecialty: {
        fontSize: 12,
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
        gap: 4,
    },
    ratingText: {
        fontSize: 13,
        fontFamily: 'Cairo_600SemiBold',
        color: '#333',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    priceText: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
    currencyText: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#064E3B',
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
