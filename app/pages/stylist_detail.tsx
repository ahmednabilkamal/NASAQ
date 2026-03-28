import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import pageData from '@/data/content';
import apiService, { Stylist, StylistReview, StylistService } from '@/config/apiService';
import { getBackChevron } from '@/config/directionalIcons';
import { ServicePackageCard } from '@/components/home';
import { APP_LANGUAGE } from '@/config/languageRef';

export default function StylistDetailScreen() {
    type TabKey = 'services' | 'bio' | 'portfolio' | 'reviews';
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const content = (pageData as any)[APP_LANGUAGE]?.stylistDetail || (pageData as any)['ar'].stylistDetail;
    const [stylist, setStylist] = useState<Stylist | null>(null);
    const [services, setServices] = useState<StylistService[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [booking, setBooking] = useState(false);
    const [showServicePicker, setShowServicePicker] = useState(false);
    const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<StylistService | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>('services');

    const formatMetric = (value: unknown, unit: string) => {
        if (value === null || value === undefined || value === '') return null;
        const n = Number(value);
        if (Number.isFinite(n)) return `${n} ${unit}`;
        const s = String(value).trim();
        return s ? `${s} ${unit}` : null;
    };

    useEffect(() => {
        if (!id) {
            return;
        }
        const fetchData = async () => {
            setLoading(true);
            try {
                const [stylistRes, favsRes] = await Promise.all([
                    apiService.getStylistById(id),
                    apiService.getFavorites(),
                ]);

                const data: Stylist = stylistRes?.data ?? stylistRes;
                setStylist(data);
                if (Array.isArray(data?.services)) {
                    setServices(data.services);
                }

                const favorites = favsRes.data || [];
                setIsFavorite(favorites.some((f) => String(f.id) === String(id)));
            } catch (error: any) {
                console.error('Stylist detail fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleToggleFavorite = async () => {
        if (!id) return;
        try {
            const res = await apiService.toggleFavorite(id);
            setIsFavorite(res.data.is_favorite);
        } catch (error) {
            console.error('Toggle favorite error:', error);
        }
    };

    const handleContact = async () => {
        if (!id) {
            return;
        }
        try {
            const res = await apiService.startConversation(Number(id));
            const conversation = (res?.data as any) ?? res;
            const conversationId = conversation?.id;
            router.push(`/pages/chat?id=${conversationId}` as any);
        } catch (error) {
            console.error('Start conversation error:', error);
            router.push('/pages/chat' as any);
        }
    };

    const handleBookAndPay = async (service?: StylistService) => {
        if (!id) return;
        const availableServices = services.filter((s) => s.available !== false);

        if (!service && availableServices.length > 1) {
            setSelectedServiceForBooking(availableServices[0] ?? null);
            setShowServicePicker(true);
            return;
        }

        const selectedService = service ?? availableServices[0];
        if (!selectedService) {
            Alert.alert('لا توجد خدمات', 'لا توجد خدمات متاحة لهذه المنسقة حالياً.');
            return;
        }

        setShowServicePicker(false);
        setSelectedServiceForBooking(null);
        const total = selectedService?.price ?? 0;
        router.push(
            `/pages/checkout?service_id=${selectedService.id}&service_title=${encodeURIComponent(selectedService.title)}&price=${total}` as any
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#064E3B" />
            </SafeAreaView>
        );
    }

    const hasRealImage = Boolean(stylist?.image && String(stylist.image).trim() !== '');
    const stylistHeight = formatMetric((stylist as any)?.height, 'cm');
    const stylistWeight = formatMetric((stylist as any)?.weight, 'kg');
    const portfolioImages = Array.isArray(stylist?.images) ? (stylist?.images as string[]) : [];
    const reviews = Array.isArray(stylist?.reviews) ? (stylist?.reviews as StylistReview[]) : [];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIconButton}>
                    <Ionicons name={getBackChevron()} size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {stylist?.name || content.title || 'المنسقة'}
                </Text>
                <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerIconButton}>
                    <Ionicons
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={24}
                        color={isFavorite ? '#E11D48' : '#333'}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.photoWrap}>
                    {hasRealImage ? (
                        <Image source={{ uri: stylist!.image as string }} style={styles.heroPhoto} resizeMode="cover" />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Ionicons name="image-outline" size={56} color="#CCC" />
                            <Text style={styles.photoPlaceholderText}>لا توجد صورة للمنسقة</Text>
                        </View>
                    )}
                </View>

                <View style={styles.servicesSection}>
                    {(stylistHeight || stylistWeight) && (
                        <View style={styles.metricsRow}>
                            {stylistHeight && (
                                <View style={styles.metricPill}>
                                    <Text style={styles.metricText}>Height: {stylistHeight}</Text>
                                </View>
                            )}
                            {stylistWeight && (
                                <View style={styles.metricPill}>
                                    <Text style={styles.metricText}>Weight: {stylistWeight}</Text>
                                </View>
                            )}
                        </View>
                    )}
                    <View style={styles.tabsRow}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'services' && styles.tabButtonActive]}
                            onPress={() => setActiveTab('services')}
                        >
                            <Text style={[styles.tabText, activeTab === 'services' && styles.tabTextActive]}>الخدمات</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'bio' && styles.tabButtonActive]}
                            onPress={() => setActiveTab('bio')}
                        >
                            <Text style={[styles.tabText, activeTab === 'bio' && styles.tabTextActive]}>نبذة</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'portfolio' && styles.tabButtonActive]}
                            onPress={() => setActiveTab('portfolio')}
                        >
                            <Text style={[styles.tabText, activeTab === 'portfolio' && styles.tabTextActive]}>الأعمال</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'reviews' && styles.tabButtonActive]}
                            onPress={() => setActiveTab('reviews')}
                        >
                            <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>التقييمات</Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'services' && (
                        <>
                            <Text style={styles.servicesHeading}>{content.services || 'الخدمات'}</Text>
                            {services.length > 0 ? (
                                <View style={styles.servicesGrid}>
                                    {services.map((service, index) => (
                                        <ServicePackageCard
                                            key={String(service.id)}
                                            title={service.title}
                                            subtitle={
                                                service.category?.name?.trim()
                                                    ? service.category.name
                                                    : 'متاحة ٢٤ ساعة'
                                            }
                                            price={
                                                typeof service.price === 'number'
                                                    ? service.price
                                                    : parseFloat(String(service.price ?? '0'))
                                            }
                                            variant={index % 3 === 1 ? 'dark' : 'light'}
                                            onPress={() => handleBookAndPay(service)}
                                        />
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.noDataText}>لا توجد خدمات متاحة</Text>
                            )}
                        </>
                    )}

                    {activeTab === 'bio' && (
                        <View style={styles.tabPanel}>
                            <Text style={styles.bioText}>
                                {stylist?.bio || stylist?.about || 'لا توجد نبذة متاحة حالياً.'}
                            </Text>
                        </View>
                    )}

                    {activeTab === 'portfolio' && (
                        <View style={styles.tabPanel}>
                            {portfolioImages.length > 0 ? (
                                <View style={styles.portfolioGrid}>
                                    {portfolioImages.map((img, idx) => (
                                        <Image
                                            key={`${img}-${idx}`}
                                            source={{ uri: img }}
                                            style={styles.portfolioImage}
                                            resizeMode="cover"
                                        />
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.noDataText}>لا توجد أعمال متاحة</Text>
                            )}
                        </View>
                    )}

                    {activeTab === 'reviews' && (
                        <View style={styles.tabPanel}>
                            {reviews.length > 0 ? (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reviewsRow}>
                                    {reviews.map((review) => (
                                        <View key={String(review.id)} style={styles.reviewCard}>
                                            <View style={styles.reviewHead}>
                                                <Text style={styles.reviewAuthor}>{review.user?.name || 'مستخدمة'}</Text>
                                                <View style={styles.reviewRating}>
                                                    <Ionicons name="star" size={14} color="#F59E0B" />
                                                    <Text style={styles.reviewRatingText}>{review.rating}</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.reviewBody}>
                                                "{review.review || review.comment || 'تجربة ممتازة'}"
                                            </Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            ) : (
                                <Text style={styles.noDataText}>لا توجد تقييمات حالياً</Text>
                            )}
                        </View>
                    )}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color="#064E3B" style={{ marginEnd: 8 }} />
                    <Text style={styles.contactButtonText}>تواصلي مع المنسقة</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.bookButton, booking && { opacity: 0.7 }]}
                    onPress={() => handleBookAndPay()}
                    disabled={booking}
                >
                    {booking ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Ionicons name="calendar-outline" size={18} color="#FFF" style={{ marginEnd: 8 }} />
                            <Text style={styles.bookButtonText}>احجزي والدفع</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {showServicePicker && (
                <View style={styles.pickerOverlay}>
                    <View style={styles.pickerSheet}>
                        <Text style={styles.pickerTitle}>اختاري الخدمة</Text>
                        {services
                            .filter((s) => s.available !== false)
                            .map((svc) => (
                                <TouchableOpacity
                                    key={String(svc.id)}
                                    style={[
                                        styles.pickerItem,
                                        selectedServiceForBooking?.id != null &&
                                            String(selectedServiceForBooking.id) === String(svc.id) &&
                                            styles.pickerItemSelected,
                                    ]}
                                    onPress={() => setSelectedServiceForBooking(svc)}
                                >
                                    <Text style={styles.pickerPrice}>{svc.price} ر.س</Text>
                                    <Text style={styles.pickerItemTitle}>{svc.title}</Text>
                                </TouchableOpacity>
                            ))}

                        <TouchableOpacity
                            style={[styles.pickerConfirmButton, booking && { opacity: 0.7 }]}
                            onPress={() => selectedServiceForBooking && handleBookAndPay(selectedServiceForBooking)}
                            disabled={!selectedServiceForBooking || booking}
                        >
                            <Text style={styles.pickerConfirmText}>متابعة للدفع</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.pickerCancel} onPress={() => setShowServicePicker(false)}>
                            <Text style={styles.pickerCancelText}>إلغاء</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        flex: 1,
        fontSize: 17,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        textAlign: 'center',
        marginHorizontal: 8,
    },
    headerIconButton: {
        width: 40,
        height: 40,
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoWrap: {
        width: '100%',
        aspectRatio: 3 / 4,
        backgroundColor: '#F3F4F6',
    },
    heroPhoto: {
        width: '100%',
        height: '100%',
    },
    photoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    photoPlaceholderText: {
        marginTop: 12,
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#9CA3AF',
        textAlign: 'center',
    },
    servicesSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    tabsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 8,
        marginBottom: 14,
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderRadius: 0,
        backgroundColor: 'transparent',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabButtonActive: {
        borderBottomColor: '#111',
    },
    tabText: {
        fontFamily: 'Cairo_600SemiBold',
        fontSize: 16,
        color: '#9CA3AF',
    },
    tabTextActive: {
        color: '#111827',
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 8,
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    metricPill: {
        backgroundColor: '#F3F4F6',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    metricText: {
        fontSize: 12,
        fontFamily: 'Cairo_600SemiBold',
        color: '#374151',
    },
    servicesHeading: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        textAlign: 'right',
        alignSelf: 'stretch',
        marginBottom: 16,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    noDataText: {
        fontFamily: 'Cairo_400Regular',
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        paddingVertical: 20,
    },
    tabPanel: {
        marginTop: 8,
    },
    bioText: {
        fontFamily: 'Cairo_400Regular',
        fontSize: 14,
        color: '#374151',
        lineHeight: 24,
        textAlign: 'right',
    },
    portfolioGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    portfolioImage: {
        width: '48%',
        height: 130,
        borderRadius: 14,
        backgroundColor: '#F3F4F6',
    },
    reviewsRow: {
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 4,
    },
    reviewCard: {
        width: 260,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderRadius: 14,
        padding: 10,
        backgroundColor: '#FFF',
    },
    reviewHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewAuthor: {
        fontFamily: 'Cairo_700Bold',
        fontSize: 13,
        color: '#111827',
    },
    reviewRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    reviewRatingText: {
        fontFamily: 'Cairo_600SemiBold',
        fontSize: 12,
        color: '#92400E',
    },
    reviewBody: {
        fontFamily: 'Cairo_400Regular',
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 22,
        textAlign: 'right',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        gap: 10,
        padding: 16,
        paddingBottom: 28,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    contactButton: {
        flex: 1,
        height: 52,
        borderRadius: 26,
        borderWidth: 2,
        borderColor: '#064E3B',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    contactButtonText: {
        color: '#064E3B',
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
    },
    bookButton: {
        flex: 1,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#064E3B',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    bookButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
    },
    pickerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    pickerSheet: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    pickerTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        textAlign: 'center',
        marginBottom: 16,
    },
    pickerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#F8F9FB',
        borderRadius: 14,
        marginBottom: 10,
    },
    pickerItemTitle: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        flex: 1,
        marginEnd: 12,
    },
    pickerPrice: {
        fontSize: 14,
        fontFamily: 'Cairo_600SemiBold',
        color: '#064E3B',
    },
    pickerCancel: {
        marginTop: 6,
        paddingVertical: 14,
        alignItems: 'center',
    },
    pickerCancelText: {
        fontSize: 15,
        fontFamily: 'Cairo_600SemiBold',
        color: '#EF4444',
    },
    pickerItemSelected: {
        borderWidth: 2,
        borderColor: '#064E3B',
        backgroundColor: '#ECFDF5',
    },
    pickerConfirmButton: {
        marginTop: 10,
        backgroundColor: '#064E3B',
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickerConfirmText: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#FFF',
    },
});
