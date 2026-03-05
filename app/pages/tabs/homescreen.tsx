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
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
    const { user } = useAuth();
    const router = useRouter();

    const [banners, setBanners] = useState<Banner[]>([]);
    const [stylists, setStylists] = useState<Stylist[]>([]);
    const [packages, setPackages] = useState<RecommendedService[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeData = async () => {
            setLoading(true);
            try {
                const [bannersRes, stylistsRes, packagesRes] = await Promise.allSettled([
                    apiService.getBanners(),
                    apiService.getTrustedStylists(),
                    apiService.getRecommendedServices({ per_page: 6 }),
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
            } catch (error) {
                console.error('HomeScreen fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    const handleStylistPress = (stylistId: number | string) => {
        router.push(`/pages/stylist_detail?id=${stylistId}` as any);
    };

    const handlePackagePress = (packageId: number | string) => {
        console.log('Package pressed:', packageId);
    };

    // Hero banner: use first banner from API or a static fallback
    const heroBanner = banners[0];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <HomeHeader
                userName={user?.name || 'نور حسن'}
                greeting="صباح الخير"
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
                    {/* Hero Banner */}
                    <HeroBanner
                        title={heroBanner?.title ?? 'اختيار الفئة المناسبة لجسمك بفرق أكثر من القطعة نفسها.'}
                        subtitle=""
                        buttonText="عرض الكل"
                        imageUri={heroBanner?.image ? { uri: heroBanner.image } : require('@/assets/stylewomen1.png')}
                        onPress={() => console.log('Banner pressed')}
                    />

                    {/* Expert Stylists Section */}
                    {stylists.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionLink}>View all.</Text>
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
                                        imageUri={item.image ? { uri: item.image } : require('@/assets/stylewomen1.png')}
                                        rating={typeof item.rating === 'number' ? item.rating : parseFloat(String(item.rating ?? '0'))}
                                        clientCount={item.clients_count ?? 0}
                                        price={item.price}
                                        tags={item.fashion_styles?.map((s: any) => s.name) ?? []}
                                        onPress={() => handleStylistPress(item.id)}
                                    />
                                )}
                            />
                        </View>
                    )}

                    {/* Service Packages Section */}
                    {packages.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Packages designed for your needs</Text>
                            </View>

                            <View style={styles.packagesGrid}>
                                {packages.map((pkg, index) => (
                                    <ServicePackageCard
                                        key={String(pkg.id)}
                                        title={pkg.title}
                                        subtitle="Available 24 hours"
                                        price={typeof pkg.price === 'number' ? pkg.price : parseFloat(String(pkg.price ?? '0'))}
                                        variant={index % 3 === 1 ? 'dark' : 'light'}
                                        onPress={() => handlePackagePress(pkg.id)}
                                    />
                                ))}
                            </View>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
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
    packagesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },

    bottomSpacer: {
        height: 80,
    },
});
