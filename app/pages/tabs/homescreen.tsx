import BottomNav from '@/components/BottomNav';
import HomeScreenSkeleton from '@/components/home/HomeSkeleton';
import { HeroBanner, HomeHeader, HomeReviewsSection, HomeWhyUsSection, StylistCard } from '@/components/home';
import { useAuth } from '@/config/authContext';
import { isStylistUser, isStylistVerified } from '@/config/navigationFlow';
import { ROUTES } from '@/constants/routes';
import { apiService, Banner, HomeFeedReview, Stylist } from '@/config/apiService';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { userScreenDirection } from '@/config/rtlLayout';
import { rtlText } from '@/config/rtlText';
import { normalizeReviewsApiPayload } from '@/utils/homeReviews';
import { pickResolvedEntityImageUrl, resolveMediaUrl, toResolvedImageSource } from '@/utils/resolveMediaUrl';

const HomeScreen = () => {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const [banners, setBanners] = useState<Banner[]>([]);
    const [bannerError, setBannerError] = useState<string | null>(null);
    const [stylists, setStylists] = useState<Stylist[]>([]);
    const [popularStylists, setPopularStylists] = useState<Stylist[]>([]);
    const [homeReviews, setHomeReviews] = useState<HomeFeedReview[]>([]);
    const [loading, setLoading] = useState(true);
    // Set of stylist IDs the user has favorited
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const sectionAnims = React.useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;

    const sectionAnimatedStyle = (anim: Animated.Value) => ({
        opacity: anim,
        transform: [
            {
                translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                }),
            },
        ],
    });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/pages/login');
        } else if (!authLoading && isAuthenticated && isStylistUser(user)) {
            router.replace(
                (isStylistVerified(user) ? ROUTES.stylist.home : ROUTES.stylist.pendingVerification) as any
            );
        }
    }, [isAuthenticated, authLoading, user, router]);

    useEffect(() => {
        const fetchHomeData = async () => {
            if (!isAuthenticated) return;
            setLoading(true);
            setBannerError(null);
            try {
                const [bannersRes, stylistsRes, popularRes, favoritesRes, reviewsRes] = await Promise.allSettled([
                    apiService.getBanners(),
                    apiService.getTrustedStylists(),
                    apiService.getPopularStylists({ limit: 10 }),
                    apiService.getFavorites(),
                    apiService.getRecentStylistReviews({ limit: 12 }),
                ]);

                let stylistsList: Stylist[] = [];

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
                    stylistsList = Array.isArray(data) ? data : [];
                    setStylists(stylistsList);
                }
                if (popularRes.status === 'fulfilled') {
                    const data = popularRes.value?.data;
                    setPopularStylists(Array.isArray(data) ? data : []);
                } else {
                    setPopularStylists([]);
                }
                if (favoritesRes.status === 'fulfilled') {
                    const data = favoritesRes.value?.data;
                    if (Array.isArray(data)) {
                        setFavoriteIds(new Set(data.map((s: any) => String(s.id))));
                    }
                }

                let nextReviews: HomeFeedReview[] = [];
                if (reviewsRes.status === 'fulfilled') {
                    nextReviews = normalizeReviewsApiPayload(reviewsRes.value?.data);
                }
                if (reviewsRes.status !== 'fulfilled') {
                    // Strict behavior: do not show unselected reviews from other endpoints.
                    nextReviews = [];
                }
                setHomeReviews(nextReviews);
            } catch (error) {
                console.error('HomeScreen fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, [isAuthenticated]);

    useEffect(() => {
        if (loading || !isAuthenticated) return;

        sectionAnims.forEach((anim) => anim.setValue(0));
        Animated.stagger(
            110,
            sectionAnims.map((anim) =>
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 320,
                    useNativeDriver: true,
                })
            )
        ).start();
    }, [isAuthenticated, loading, sectionAnims]);

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

    const heroSlides = banners
        .filter((b) => b && b.status !== false)
        .map((b) => {
            const src = resolveMediaUrl(b.image_url || b.image);
            return { b, src };
        })
        .filter(({ src }) => src != null && String(src).trim() !== '')
        .slice(0, 5)
        .map(({ b, src }) => ({
            id: String(b.id),
            title: b.title ?? '',
            imageUri: { uri: src! },
            link: b.link,
        }));

    if (authLoading) {
        return (
            <View style={[styles.loadingContainer, userScreenDirection]}>
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
        <SafeAreaView style={[styles.container, userScreenDirection]} edges={['top']}>
            {/* Header */}
            <HomeHeader
                userName={user?.name || 'نور حسن'}
                greeting="صباح الخير"
                avatarUri={user?.image || undefined}
                onSearchPress={() =>
                    router.push({ pathname: '/pages/tabs/stylists', params: { focusSearch: '1' } } as any)
                }
                onNotificationPress={() => router.push('/pages/notifications' as any)}
            />

            {loading ? (
                <HomeScreenSkeleton />
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Banner */}
                    <Animated.View style={sectionAnimatedStyle(sectionAnims[0])}>
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
                    </Animated.View>

                    {/* Expert Stylists Section */}
                    {stylists.length > 0 && (
                        <Animated.View style={[styles.section, sectionAnimatedStyle(sectionAnims[2])]}>
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
                                        imageUri={toResolvedImageSource(pickResolvedEntityImageUrl(item as any)) ?? null}
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
                        </Animated.View>
                    )}

                    {/* Why us */}
                    <Animated.View style={[styles.section, sectionAnimatedStyle(sectionAnims[1])]}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>ليش تختارنا؟</Text>
                            <View />
                        </View>
                        <HomeWhyUsSection />
                    </Animated.View>

                    {/* Popular Stylists Slider */}
                    {popularStylists.length > 0 && (
                        <Animated.View style={[styles.section, sectionAnimatedStyle(sectionAnims[3])]}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>المنسقات الأشهر</Text>
                                <TouchableOpacity onPress={() => router.push('/pages/tabs/stylists' as any)}>
                                    <Text style={styles.sectionLink}>عرض الكل</Text>
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={popularStylists}
                                keyExtractor={(item) => `popular-${String(item.id)}`}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.stylistsList}
                                renderItem={({ item }) => (
                                    <StylistCard
                                        name={item.name}
                                        subtitle={item.bio}
                                        imageUri={toResolvedImageSource(pickResolvedEntityImageUrl(item as any)) ?? null}
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
                        </Animated.View>
                    )}

                    {/* Top Rated Stylists Slider */}
                    {topRatedStylists.length > 0 && (
                        <Animated.View style={[styles.section, sectionAnimatedStyle(sectionAnims[4])]}>
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
                                        imageUri={toResolvedImageSource(pickResolvedEntityImageUrl(item as any)) ?? null}
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
                        </Animated.View>
                    )}

                    {/* Customer reviews */}
                    {homeReviews.length > 0 && (
                        <Animated.View style={[styles.section, sectionAnimatedStyle(sectionAnims[5])]}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>آراء العملاء</Text>
                                <View />
                            </View>
                            <HomeReviewsSection reviews={homeReviews} />
                        </Animated.View>
                    )}

                    {/* Bottom spacing for BottomNav (service packages strip removed) */}
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
        ...rtlText.alignStart,
    },
    sectionLink: {
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#064E3B',
        ...rtlText.alignEnd,
    },
    stylistsList: {
        paddingHorizontal: 20,
        gap: 12,
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
        ...rtlText.alignStart,
    },

    bottomSpacer: {
        height: 120,
    },
});
