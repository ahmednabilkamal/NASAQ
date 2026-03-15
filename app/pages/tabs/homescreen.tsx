import BottomNav from '@/components/BottomNav';
import { HeroBanner, HomeHeader, ServicePackageCard, StylistCard } from '@/components/home';
import { useAuth } from '@/config/authContext';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import apiService, { Banner, Stylist, RecommendedService } from '@/config/apiService';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, IconSizes } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode] || (pageData as any)['en'];

    const [banners, setBanners] = useState<Banner[]>([]);
    const [stylists, setStylists] = useState<Stylist[]>([]);
    const [packages, setPackages] = useState<RecommendedService[]>([]);
    const [loading, setLoading] = useState(true);
    // Set of stylist IDs the user has favorited
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/pages/login');
        }
    }, [isAuthenticated, authLoading]);

    useEffect(() => {
        const fetchHomeData = async () => {
            if (!isAuthenticated) return;
            setLoading(true);
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

    // Hero banner: use first banner from API or a static fallback
    const heroBanner = banners[0];

    if (authLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#064E3B" />
            </View>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <HomeHeader
                userName={user?.name || content.common?.defaultName || 'نور حسن'}
                greeting={content.common?.greeting || 'صباح الخير'}
                onSearchPress={() => console.log('Search pressed')}
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
                    <HeroBanner
                        title="اختيار القصة المناسبة لجسمك يفرق أكثر من القطعة نفسها."
                        subtitle=""
                        buttonText={content.common?.viewAll || 'عرض الكل'}
                        imageUri={require('@/assets/mirroimagewomen.png')}
                        onPress={() => console.log('Banner pressed')}
                    />

                    {stylists.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionLink}>{content.common?.viewAll || 'View all.'}</Text>
                                <Text style={styles.sectionTitle}>Stylists trusted by many</Text>
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
                                        rating={typeof item.rating === 'number' ? item.rating : parseFloat(String(item.rating ?? '0'))}
                                        clientCount={item.clients_count ?? 0}
                                        price={item.price}
                                        tags={item.fashion_styles?.map((s: any) => s.name) ?? []}
                                        onPress={() => handleStylistPress(item.id)}
                                        isFavorite={favoriteIds.has(String(item.id))}
                                        onFavoriteToggle={() => handleFavoriteToggle(item.id)}
                                    />
                                )}
                            />
                        </View>
                    )}

                    {packages.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>{content.home?.packages?.title || 'Packages designed for your needs'}</Text>
                            </View>

                            <View style={styles.packagesGrid}>
                                {packages.map((pkg, index) => (
                                    <ServicePackageCard
                                        key={String(pkg.id)}
                                        title={pkg.title}
                                        subtitle={content.home?.packages?.box1?.subtitle || 'Available 24 hours'}
                                        price={typeof pkg.price === 'number' ? pkg.price : parseFloat(String(pkg.price ?? '0'))}
                                        variant={index % 3 === 1 ? 'dark' : 'light'}
                                        onPress={() => handlePackagePress(pkg.id)}
                                    />
                                ))}
                            </View>
                        </View>
                    )}

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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: Spacing.verticalXl,
    },
    section: {
        marginTop: scaleVertical(24),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        marginBottom: Spacing.verticalMd,
    },
    sectionTitle: {
        fontSize: FontSizes.h4,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
    },
    sectionLink: {
        fontSize: FontSizes.label,
        fontFamily: 'Cairo_400Regular',
        color: '#064E3B',
    },
    stylistsList: {
        paddingHorizontal: Spacing.screenPaddingHorizontal,
    },
    packagesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.screenPaddingHorizontal,
    },

    bottomSpacer: {
        height: scaleVertical(80),
    },
});
