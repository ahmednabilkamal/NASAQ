import BottomNav from '@/components/BottomNav';
import { HeroBanner, HomeHeader, ServicePackageCard, StylistCard } from '@/components/home';
import { useAuth } from '@/config/authContext';
import apiService, { Banner, Stylist, RecommendedService } from '@/config/apiService';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const [banners, setBanners] = useState<Banner[]>([]);
    const [bannerError, setBannerError] = useState<string | null>(null);
    const [stylists, setStylists] = useState<Stylist[]>([]);
    const [packages, setPackages] = useState<RecommendedService[]>([]);
    const [loading, setLoading] = useState(true);
    // Set of stylist IDs the user has favorited
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/pages/login');
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        const fetchHomeData = async () => {
            if (!isAuthenticated) return;
            setLoading(true);
            setBannerError(null);
            try {
                const [bannersRes, stylistsRes, packagesRes, favoritesRes] = await Promise.allSettled([
                    apiService.getBanners(),
                    apiService.getTrustedStylists(),
                    apiService.getRecommendedServices({ per_page: 6 }),
                    apiService.getFavorites(),
                ]);

                if (bannersRes.status === 'fulfilled') {
                    const data = bannersRes.value?.data;
                    setBanners(Array.isArray(data) ? data : []);
                    if (!Array.isArray(data) || data.length === 0) {
                        setBannerError(null);
                    }
                } else {
                    setBanners([]);
                    setBannerError('تعذر تحميل اللافتات حالياً.');
                }
                if (stylistsRes.status === 'fulfilled') {
                    const data = stylistsRes.value?.data;
                    setStylists(Array.isArray(data) ? data : []);
                }
                if (packagesRes.status === 'fulfilled') {
                    const data = packagesRes.value?.data;
                    setPackages(Array.isArray(data) ? data : []);
                }
                if (favoritesRes.status === 'fulfilled') {
                    const data = favoritesRes.value?.data;
                    if (Array.isArray(data)) {
                        setFavoriteIds(new Set(data.map((s: any) => String(s.id))));
                    }
                }
            } catch (error) {
                console.error('HomeScreen fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, [isAuthenticated]);

    const handleStylistPress = (stylistId: number | string) => {
        router.push(`/pages/stylist_detail?id=${stylistId}` as any);
    };

    const handleFavoriteToggle = async (stylistId: number | string) => {
        const id = String(stylistId);
        // Optimistic update
        setFavoriteIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
        try {
            await apiService.toggleFavorite(stylistId);
        } catch (error) {
            // Revert on failure
            setFavoriteIds(prev => {
                const next = new Set(prev);
                if (next.has(id)) {
                    next.delete(id);
                } else {
                    next.add(id);
                }
                return next;
            });
            console.error('Toggle favorite error:', error);
        }
    };

    const handlePackagePress = (packageId: number | string) => {
        console.log('Package pressed:', packageId);
    };

    const fallbackHeroImage = require('@/assets/mirroimagewomen.png');
    const heroSlides = banners
        .filter((b) => b && b.status !== false)
        .slice(0, 5)
        .map((b) => ({
            id: String(b.id),
            title: b.title ?? '',
            imageUri: b.image_url
                ? { uri: b.image_url }
                : b.image
                    ? { uri: b.image }
                    : fallbackHeroImage,
            link: b.link,
        }));

    if (authLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#064E3B" />
            </View>
        );
    }

    if (!isAuthenticated) return null;

    // Secondary slider: show top rated stylists.
    const topRatedStylists = [...stylists]
        .sort((a: any, b: any) => parseFloat(String(b?.rating ?? 0)) - parseFloat(String(a?.rating ?? 0)))
        .slice(0, 10);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <HomeHeader
                userName={user?.name || 'نور حسن'}
                greeting="صباح الخير"
                onSearchPress={() =>
                    router.push({ pathname: '/pages/tabs/stylists', params: { focusSearch: '1' } } as any)
                }
                onNotificationPress={() => router.push('/pages/notifications' as any)}
            />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#064E3B" />
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Banner */}
                    {bannerError ? (
                        <View style={styles.heroEmptyContainer}>
                            <Text style={styles.heroEmptyText}>{bannerError}</Text>
                        </View>
                    ) : heroSlides.length > 0 ? (
                        <HeroBanner
                            slides={heroSlides}
                            onPressSlide={(slide) => {
                                // Home page: we don't navigate in this MVP.
                                console.log('Banner pressed:', slide.id, slide.link);
                            }}
                        />
                    ) : (
                        <View style={styles.heroEmptyContainer}>
                            <Text style={styles.heroEmptyText}>لا توجد لافتات حالياً.</Text>
                        </View>
                    )}

                    {/* Expert Stylists Section */}
                    {stylists.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>منسقات موثوقة</Text>
                                <TouchableOpacity onPress={() => router.push('/pages/tabs/stylists' as any)}>
                                    <Text style={styles.sectionLink}>عرض الكل</Text>
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={stylists}
                                keyExtractor={(item) => String(item.id)}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.stylistsList}
                                renderItem={({ item }) => (
                                    <StylistCard
                                        name={item.name}
                                        subtitle={item.bio}
                                        imageUri={item.image ? { uri: item.image } : null}
                                        rating={
                                            typeof item.rating === 'number'
                                                ? item.rating
                                                : parseFloat(String(item.rating ?? '0'))
                                        }
                                        clientCount={item.clients_count ?? 0}
                                        tags={item.fashion_styles?.map((s: any) => s.name) ?? []}
                                        onPress={() => handleStylistPress(item.id)}
                                        isFavorite={favoriteIds.has(String(item.id))}
                                        onFavoriteToggle={() => handleFavoriteToggle(item.id)}
                                    />
                                )}
                            />
                        </View>
                    )}

                    {/* Top Rated Stylists Slider */}
                    {topRatedStylists.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>الأعلى تقييماً</Text>
                                <TouchableOpacity onPress={() => router.push('/pages/tabs/stylists' as any)}>
                                    <Text style={styles.sectionLink}>عرض الكل</Text>
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={topRatedStylists}
                                keyExtractor={(item) => String(item.id)}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.stylistsList}
                                renderItem={({ item }) => (
                                    <StylistCard
                                        name={item.name}
                                        subtitle={item.bio}
                                        imageUri={item.image ? { uri: item.image } : null}
                                        rating={
                                            typeof item.rating === 'number'
                                                ? item.rating
                                                : parseFloat(String(item.rating ?? '0'))
                                        }
                                        clientCount={item.clients_count ?? 0}
                                        tags={item.fashion_styles?.map((s: any) => s.name) ?? []}
                                        onPress={() => handleStylistPress(item.id)}
                                        isFavorite={favoriteIds.has(String(item.id))}
                                        onFavoriteToggle={() => handleFavoriteToggle(item.id)}
                                    />
                                )}
                            />
                        </View>
                    )}

                    {/* Service Packages Section */}
                    {packages.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>باقات تناسب احتياجك</Text>
                            </View>

                            <FlatList
                                data={packages}
                                keyExtractor={(item) => String(item.id)}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.packagesSlider}
                                renderItem={({ item, index }) => (
                                    <ServicePackageCard
                                        title={item.title}
                                        subtitle="متاح خلال ٢٤ ساعة"
                                        price={
                                            typeof item.price === 'number'
                                                ? item.price
                                                : parseFloat(String(item.price ?? '0'))
                                        }
                                        variant={index % 3 === 1 ? 'dark' : 'light'}
                                        onPress={() => handlePackagePress(item.id)}
                                        containerStyle={styles.packagesSliderCard}
                                    />
                                )}
                            />
                        </View>
                    )}

                    {/* Bottom spacing for BottomNav */}
                    <View style={styles.bottomSpacer} />
                </ScrollView>
            )}

            <BottomNav />
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
    },
    sectionLink: {
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#064E3B',
    },
    stylistsList: {
        paddingHorizontal: 20,
    },
    packagesSlider: {
        paddingHorizontal: 20,
        gap: 12,
    },
    packagesSliderCard: {
        width: 180,
        marginStart: 10,
        marginEnd: 10,
    },

    heroEmptyContainer: {
        marginTop: 4,
        borderRadius: 20,
        backgroundColor: '#fff',
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginHorizontal: 20,
    },
    heroEmptyText: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#6B7280',
        textAlign: 'center',
    },

    bottomSpacer: {
        height: 80,
    },
});
