import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { userScreenDirection } from '@/config/rtlLayout';
import { rtlText } from '@/config/rtlText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import pageData from '@/data/content';
import ApiService, { Stylist, StylistReview, StylistService } from '@/config/apiService';
import { getBackChevron } from '@/config/directionalIcons';
import { ServicePackageCard } from '@/components/home';
import AnimatedFavoriteButton from '@/components/AnimatedFavoriteButton';
import StylistDetailSkeleton from '@/components/stylist/StylistDetailSkeleton';
import { APP_LANGUAGE } from '@/config/languageRef';
import SarPriceText from '@/components/SarPriceText';
import {
    entityToImageSource,
    pickStylistHeroImageUrl,
    resolveStylistPortfolioImageUrl,
} from '@/utils/resolveMediaUrl';
import { ChatLegalConsentModal } from '@/components/chat/ChatLegalConsentModal';
import { hasUserAcceptedChatLegal } from '@/utils/chatLegalConsent';

function buildOrderIdempotencyKey(serviceId: number | string): string {
    return `order:${String(serviceId)}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
}

export default function StylistDetailScreen() {
    type TabKey = 'services' | 'bio' | 'portfolio' | 'reviews';
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const content = (pageData as any)[APP_LANGUAGE]?.stylistDetail || (pageData as any)['ar'].stylistDetail;
    const [stylist, setStylist] = useState<Stylist | null>(null);
    const [services, setServices] = useState<StylistService[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showServicePicker, setShowServicePicker] = useState(false);
    const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<StylistService | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>('services');
    const [canChatWithStylist, setCanChatWithStylist] = useState<boolean | null>(null);
    const [showChatLegalModal, setShowChatLegalModal] = useState(false);

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
                    ApiService.getStylistById(id),
                    ApiService.getFavorites(),
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

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const res = await ApiService.canMessageStylist(Number(id));
                const data = (res as any)?.data ?? res;
                setCanChatWithStylist(Boolean(data?.can_chat));
            } catch {
                setCanChatWithStylist(false);
            }
        })();
    }, [id]);

    const handleToggleFavorite = async () => {
        if (!id) return;
        try {
            const res = await ApiService.toggleFavorite(id);
            setIsFavorite(res.data.is_favorite);
        } catch (error) {
            console.error('Toggle favorite error:', error);
        }
    };

    const runStartConversation = async () => {
        if (!id) {
            return;
        }
        try {
            const res = await ApiService.startConversation(Number(id));
            const conversation = (res?.data as any) ?? res;
            const conversationId = conversation?.id;
            if (conversationId != null) {
                router.push(`/pages/chat?id=${conversationId}` as any);
            }
        } catch (error: any) {
            const msg =
                error?.response?.data?.message ||
                'لا يمكن بدء المحادثة إلا عند وجود طلب نشط مع هذا المنسّق.';
            Alert.alert('تنبيه', typeof msg === 'string' ? msg : String(msg));
        }
    };

    const handleContact = async () => {
        if (!id) {
            return;
        }
        const accepted = await hasUserAcceptedChatLegal();
        if (!accepted) {
            setShowChatLegalModal(true);
            return;
        }
        await runStartConversation();
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
            Alert.alert('لا توجد خدمات', 'لا توجد خدمات متاحة لهذا المنسّق حالياً.');
            return;
        }

        setShowServicePicker(false);
        setSelectedServiceForBooking(null);
        const total = selectedService?.price ?? 0;
        const idempotencyKey = buildOrderIdempotencyKey(selectedService.id);
        router.push(
            `/pages/checkout?service_id=${selectedService.id}&service_title=${encodeURIComponent(selectedService.title)}&price=${total}&idempotency_key=${encodeURIComponent(idempotencyKey)}` as any
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, userScreenDirection]} edges={['top']}>
                <StylistDetailSkeleton />
            </SafeAreaView>
        );
    }

    const heroUri = stylist ? pickStylistHeroImageUrl(stylist as unknown as Record<string, unknown>) : undefined;
    const hasRealImage = Boolean(heroUri);
    const stylistHeight = formatMetric((stylist as any)?.height, 'cm');
    const stylistWeight = formatMetric((stylist as any)?.weight, 'kg');
    const portfolioImages = Array.isArray(stylist?.images) ? stylist.images : [];
    const reviews = Array.isArray(stylist?.reviews) ? (stylist?.reviews as StylistReview[]) : [];

    const renderStars = (rawRating: unknown) => {
        const n = Math.round(Number(rawRating ?? 0));
        const rating = Number.isFinite(n) ? Math.min(5, Math.max(0, n)) : 0;
        return (
            <View style={styles.starsRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <Ionicons
                        key={`s-${i}`}
                        name={i < rating ? 'star' : 'star-outline'}
                        size={18}
                        color="#F59E0B"
                    />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, userScreenDirection]} edges={['top']}>
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIconButton}>
                    <Ionicons name={getBackChevron()} size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {stylist?.name || content.title || 'المنسّق'}
                </Text>
                <AnimatedFavoriteButton
                    isFavorite={isFavorite}
                    onPress={handleToggleFavorite}
                    size={24}
                    activeColor="#E11D48"
                    inactiveColor="#333"
                    style={styles.headerIconButton}
                />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.photoWrap}>
                    {hasRealImage ? (
                        <Image source={{ uri: heroUri! }} style={styles.heroPhoto} resizeMode="cover" />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Ionicons name="image-outline" size={56} color="#CCC" />
                            <Text style={styles.photoPlaceholderText}>لا توجد صورة للمنسّق</Text>
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
                                    {portfolioImages.map((img, idx) => {
                                        const pu = resolveStylistPortfolioImageUrl(img);
                                        if (!pu) return null;
                                        return (
                                            <Image
                                                key={`p-${idx}-${pu}`}
                                                source={{ uri: pu }}
                                                style={styles.portfolioImage}
                                                resizeMode="cover"
                                            />
                                        );
                                    })}
                                </View>
                            ) : (
                                <Text style={styles.noDataText}>لا توجد أعمال متاحة</Text>
                            )}
                        </View>
                    )}

                    {activeTab === 'reviews' && (
                        <View style={styles.tabPanel}>
                            {reviews.length > 0 ? (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.reviewsRow}
                                    snapToInterval={316}
                                    decelerationRate="fast"
                                >
                                    {reviews.map((review) => (
                                        <View key={String(review.id)} style={styles.reviewCard}>
                                            <View style={styles.reviewTopRow}>
                                                <View style={styles.reviewAvatarWrap}>
                                                    {entityToImageSource(review.user as any) ? (
                                                        <Image
                                                            source={entityToImageSource(review.user as any)}
                                                            style={styles.reviewAvatar}
                                                        />
                                                    ) : (
                                                        <View style={styles.reviewAvatarFallback}>
                                                            <Ionicons name="person" size={18} color="#9CA3AF" />
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                            <Text style={styles.reviewAuthorCenter} numberOfLines={1}>
                                                {review.user?.name || 'مستخدمة'}
                                            </Text>
                                            {renderStars(review.rating)}
                                            <Text style={styles.reviewBody}>
                                                {
                                                    '\u201c' +
                                                    (review.review || review.comment || 'تجربة ممتازة') +
                                                    '\u201d'
                                                }
                                            </Text>
                                            <Ionicons name="heart-outline" size={20} color="#9CA3AF" style={styles.reviewHeart} />
                                        </View>
                                    ))}
                                </ScrollView>
                            ) : (
                                <Text style={styles.noDataText}>لا توجد تقييمات حالياً</Text>
                            )}
                        </View>
                    )}
                </View>

                <View style={{ height: canChatWithStylist === true ? 120 : 32 }} />
            </ScrollView>

            {canChatWithStylist === true ? (
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                        <Ionicons
                            name="chatbubble-ellipses-outline"
                            size={18}
                            color="#064E3B"
                            style={styles.footerIcon}
                        />
                        <Text style={styles.contactButtonText}>{content.connectButton}</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            {showServicePicker && (
                <View style={styles.pickerOverlay}>
                    <View style={styles.pickerSheet}>
                        <Text style={styles.pickerTitle}>اختر الخدمة</Text>
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
                                    <SarPriceText value={svc.price} textStyle={styles.pickerPrice} />
                                    <Text style={styles.pickerItemTitle}>{svc.title}</Text>
                                </TouchableOpacity>
                            ))}

                        <TouchableOpacity
                            style={styles.pickerConfirmButton}
                            onPress={() => selectedServiceForBooking && handleBookAndPay(selectedServiceForBooking)}
                            disabled={!selectedServiceForBooking}
                        >
                            <Text style={styles.pickerConfirmText}>متابعة للدفع</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.pickerCancel} onPress={() => setShowServicePicker(false)}>
                            <Text style={styles.pickerCancelText}>إلغاء</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <ChatLegalConsentModal
                visible={showChatLegalModal}
                onClose={() => setShowChatLegalModal(false)}
                onAccepted={runStartConversation}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
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
        marginHorizontal: 8,
        textAlign: 'center',
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
        aspectRatio: 3 / 3.5,
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
        ...rtlText.alignStart,
    },
    servicesSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    tabsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginBottom: 14,
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 6,
        marginEnd: 8,
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
        ...rtlText.alignStart,
    },
    tabTextActive: {
        color: '#111827',
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    metricPill: {
        backgroundColor: '#F3F4F6',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginEnd: 8,
        marginBottom: 8,
    },
    metricText: {
        fontSize: 12,
        fontFamily: 'Cairo_600SemiBold',
        color: '#374151',
        ...rtlText.alignStart,
        writingDirection: 'ltr',
    },
    servicesHeading: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        alignSelf: 'stretch',
        marginBottom: 16,
        ...rtlText.alignStart,
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
        paddingVertical: 20,
        ...rtlText.alignStart,
    },
    tabPanel: {
        marginTop: 8,
    },
    bioText: {
        fontFamily: 'Cairo_400Regular',
        fontSize: 14,
        color: '#374151',
        lineHeight: 24,
        ...rtlText.alignStart,
    },
    portfolioGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    portfolioImage: {
        width: '48%',
        height: 130,
        borderRadius: 14,
        backgroundColor: '#F3F4F6',
        marginBottom: 10,
    },
    reviewsRow: {
        flexDirection: 'row',
        paddingVertical: 4,
        paddingHorizontal: 6,
    },
    reviewCard: {
        width: 300,
        borderRadius: 18,
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
        marginEnd: 8,
    },
    reviewTopRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 4,
    },
    reviewAvatarWrap: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    reviewAvatar: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    reviewAvatarFallback: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    reviewAuthorCenter: {
        fontFamily: 'Cairo_700Bold',
        fontSize: 16,
        color: '#111827',
        textAlign: 'left',
        marginBottom: 4,
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 8,
        gap: 4,
    },
    reviewHeart: {
        position: 'absolute',
        bottom: 12,
        left: 14,
        opacity: 0.25,
    },
    reviewBody: {
        fontFamily: 'Cairo_400Regular',
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 22,
        textAlign: 'left',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 16,
        paddingBottom: 28,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    footerIcon: {
        marginEnd: 8,
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
        ...rtlText.alignStart,
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
        marginBottom: 16,
        ...rtlText.alignStart,
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
        ...rtlText.alignStart,
    },
    pickerPrice: {
        fontSize: 14,
        fontFamily: 'Cairo_600SemiBold',
        color: '#064E3B',
        writingDirection: 'ltr',
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
        ...rtlText.alignStart,
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
        ...rtlText.alignStart,
    },
});
