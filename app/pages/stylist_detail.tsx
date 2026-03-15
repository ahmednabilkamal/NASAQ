import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Dimensions,
    I18nManager,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import ProfileBar from '@/components/ProfileBar';
import apiService, { Stylist, StylistService } from '@/config/apiService';
import { scale, scaleVertical, wp } from '@/utils/responsive';
import { Spacing, BorderRadius, IconSizes } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';

const { width } = Dimensions.get('window');

const showAlert = (title: string, message: string) => {
    Alert.alert(title, message);
};

export default function StylistDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode] || (pageData as any)['en'];
    const isRTL = I18nManager.isRTL;

    const [activeTab, setActiveTab] = useState('about');
    const [stylist, setStylist] = useState<Stylist | null>(null);
    const [services, setServices] = useState<StylistService[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [booking, setBooking] = useState(false);
    const [showServicePicker, setShowServicePicker] = useState(false);

    useEffect(() => {
        if (!id) { return; }
        const fetchData = async () => {
            setLoading(true);
            try {
                const [stylistRes, favsRes] = await Promise.all([
                    apiService.getStylistById(id),
                    apiService.getFavorites()
                ]);

                const data: Stylist = stylistRes?.data ?? stylistRes;
                setStylist(data);
                if (Array.isArray(data?.services)) {
                    setServices(data.services);
                }

                // Check if this stylist is in favorites
                const favorites = favsRes.data || [];
                setIsFavorite(favorites.some(f => String(f.id) === String(id)));
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

    const Tabs = [
        { id: 'about', label: content.stylistDetail?.about || 'عن المنسقة' },
        { id: 'reviews', label: content.stylistDetail?.reviews || 'التقييمات' },
        { id: 'portfolio', label: content.stylistDetail?.portfolio || 'معرض الأعمال' },
        { id: 'services', label: content.stylistDetail?.services || 'الخدمات' },
    ];

    const handleContact = async () => {
        if (!id) { return; }
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
        const availableServices = services.filter(s => s.available !== false);

        if (!service && availableServices.length > 1) {
            setShowServicePicker(true);
            return;
        }

        const selectedService = service ?? availableServices[0];
        if (!selectedService) {
            showAlert(content.common?.noData || 'لا توجد خدمات', content.common?.noData || 'لا توجد خدمات متاحة لهذه المنسقة حالياً.');
            return;
        }

        setBooking(true);
        try {
            const orderRes = await apiService.createOrder({
                stylist_service_id: Number(selectedService.id),
            });
            const order = (orderRes?.data as any) ?? orderRes;
            const orderId = order?.id;

            if (!orderId) throw new Error('Order ID missing from response');

            const payRes = await apiService.initiatePayment(Number(orderId));
            const paymentUrl = (payRes?.data as any)?.payment_url;

            if (!paymentUrl) throw new Error('payment_url missing from response');

            const supported = await Linking.canOpenURL(paymentUrl);
            if (supported) {
                await Linking.openURL(paymentUrl);
            } else {
                showAlert(content.errors?.title || 'خطأ', 'تعذّر فتح صفحة الدفع.');
            }
        } catch (error: any) {
            console.error('Book & Pay error:', error);
            showAlert(content.errors?.title || 'خطأ', error?.message || 'تعذّر إتمام الحجز. يرجى المحاولة لاحقاً.');
        } finally {
            setBooking(false);
            setShowServicePicker(false);
        }
    };

    const ServiceCard = ({ item }: { item: StylistService }) => (
        <View style={styles.serviceCard}>
            <View style={styles.serviceIconContainer}>
                <Ionicons name="chevron-back" size={18} color="#064E3B" />
            </View>
            <View style={styles.serviceContent}>
                <Text style={styles.serviceTitle}>{item.title}</Text>
                {item.category?.name ? (
                    <Text style={styles.serviceSubtitle}>{item.category.name}</Text>
                ) : null}
            </View>
            <View style={styles.servicePriceBadge}>
                <Ionicons name="pricetag" size={12} color="#064E3B" />
                <Text style={styles.servicePriceText}>{item.price}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#064E3B" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIconButton}>
                    <Ionicons name="chevron-forward" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{content.stylistDetail?.title || 'تفاصيل المنسقة'}</Text>
                <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerIconButton}>
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={24}
                        color={isFavorite ? "#E11D48" : "#333"}
                    />
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.headerImageContainer}>
                    <Image
                        source={stylist?.image ? { uri: stylist.image } : require('@/assets/mirroimagewomen.png')}
                        style={styles.headerImage}
                    />
                </View>

                {/* Info Section */}
                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <Text style={styles.nameText}>{stylist?.name ?? ''}</Text>
                        {stylist?.price != null && (
                            <Text style={styles.priceText}>{stylist.price} {content.common?.currency || 'ر.س'} {content.common?.perHour || '/ ساعة'}</Text>
                        )}
                    </View>
                    {stylist?.bio ? (
                        <Text style={styles.specialtyText}>({stylist.bio})</Text>
                    ) : null}

                    <View style={styles.statsRow}>
                        {stylist?.rating != null && (
                            <View style={styles.statItem}>
                                <Ionicons name="star" size={16} color="#FFD700" />
                                <Text style={styles.statText}>
                                    {stylist.rating}
                                    {stylist.fashion_styles?.length
                                        ? ' | ' + stylist.fashion_styles.map((s: any) => s.name).join(' | ')
                                        : ''}
                                </Text>
                            </View>
                        )}
                        {stylist?.clients_count != null && (
                            <View style={styles.statItem}>
                                <Ionicons name="people-outline" size={16} color="#999" />
                                <Text style={styles.statText}>{stylist.clients_count} عميلة</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabsScroll}
                    >
                        {Tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab.id}
                                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                                onPress={() => setActiveTab(tab.id)}
                            >
                                <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.tabContent}>
                    {activeTab === 'about' && (
                        <Text style={styles.aboutText}>
                            {stylist?.about ?? (content.common?.noData || 'لا توجد معلومات متاحة')}
                        </Text>
                    )}

                    {activeTab === 'portfolio' && (
                        <View style={styles.portfolioGrid}>
                            <Image source={require('@/assets/mirroimagewomen.png')} style={styles.portfolioImage} />
                            <Image source={require('@/assets/mirroimagewomen.png')} style={styles.portfolioImage} />
                            <Image source={require('@/assets/mirroimagewomen.png')} style={styles.portfolioImage} />
                        </View>
                    )}

                    {activeTab === 'reviews' && (
                        <View style={styles.reviewsContainer}>
                            <Text style={styles.noDataText}>{content.common?.noData || 'لا توجد تقييمات بعد'}</Text>
                        </View>
                    )}

                    {activeTab === 'services' && (
                        <View style={styles.servicesGrid}>
                            {services.length > 0 ? (
                                services.map((service) => (
                                    <ServiceCard key={String(service.id)} item={service} />
                                ))
                            ) : (
                                <Text style={styles.noDataText}>{content.common?.noData || 'لا توجد خدمات متاحة'}</Text>
                            )}
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color="#064E3B" style={{ marginLeft: 8 }} />
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
                            <Ionicons name="calendar-outline" size={18} color="#FFF" style={{ marginLeft: 8 }} />
                            <Text style={styles.bookButtonText}>احجزي والدفع</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {showServicePicker && (
                <View style={styles.pickerOverlay}>
                    <View style={styles.pickerSheet}>
                        <Text style={styles.pickerTitle}>اختاري الخدمة</Text>
                        {services.filter(s => s.available !== false).map(svc => (
                            <TouchableOpacity
                                key={String(svc.id)}
                                style={styles.pickerItem}
                                onPress={() => handleBookAndPay(svc)}
                            >
                                <Text style={styles.pickerPrice}>{svc.price} {content.common?.currency || 'ر.س'}</Text>
                                <Text style={styles.pickerItemTitle}>{svc.title}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.pickerCancel}
                            onPress={() => setShowServicePicker(false)}
                        >
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
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingVertical: Spacing.verticalSm,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: FontSizes.h4,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    headerIconButton: {
        width: scale(40),
        height: scale(40),
        backgroundColor: '#F8F9FA',
        borderRadius: scale(20),
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerImageContainer: {
        height: scaleVertical(280),
        width: '100%',
    },
    headerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    infoContainer: {
        padding: Spacing.screenPadding,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.verticalSm,
    },
    nameText: {
        fontSize: FontSizes.h2,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    priceText: {
        fontSize: FontSizes.bodyLarge,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
    specialtyText: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
        marginBottom: Spacing.verticalLg,
        textAlign: 'right',
    },
    statsRow: {
        gap: Spacing.gapMd,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.gapMd,
    },
    statText: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
    },
    tabsContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    tabsScroll: {
        paddingHorizontal: Spacing.screenPaddingHorizontal,
    },
    tab: {
        paddingVertical: Spacing.verticalLg,
        marginRight: scale(25),
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#064E3B',
    },
    tabText: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_700Bold',
        color: '#999',
    },
    activeTabText: {
        color: '#064E3B',
    },
    tabContent: {
        padding: Spacing.screenPadding,
    },
    aboutText: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#444',
        lineHeight: LineHeights.body,
        textAlign: 'right',
    },
    portfolioGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.gapLg,
    },
    portfolioImage: {
        width: (wp(100) - Spacing.screenPadding * 2 - Spacing.gapLg) / 2,
        height: scaleVertical(180),
        borderRadius: BorderRadius.md,
    },
    reviewsContainer: {
        gap: Spacing.verticalLg,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.gapXl,
    },
    serviceCard: {
        width: (wp(100) - Spacing.screenPadding * 2 - Spacing.gapXl) / 2,
        backgroundColor: '#FFF',
        borderRadius: BorderRadius.lg,
        padding: Spacing.cardPadding,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    serviceIconContainer: {
        width: IconSizes.md,
        height: IconSizes.md,
        borderRadius: BorderRadius.sm,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.verticalMd,
        alignSelf: 'flex-end',
    },
    serviceContent: {
        alignItems: 'flex-end',
        marginBottom: Spacing.verticalMd,
    },
    serviceTitle: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
        textAlign: 'right',
    },
    serviceSubtitle: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_400Regular',
        color: '#888',
        textAlign: 'right',
    },
    servicePriceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.verticalXs,
        borderRadius: BorderRadius.round,
        alignSelf: 'flex-start',
        gap: Spacing.gapXs,
    },
    servicePriceText: {
        fontSize: FontSizes.label,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
    noDataText: {
        fontFamily: 'Cairo_400Regular',
        fontSize: FontSizes.body,
        color: '#999',
        textAlign: 'center',
        paddingVertical: Spacing.verticalLg,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        gap: Spacing.gapLg,
        padding: Spacing.cardPadding,
        paddingBottom: scaleVertical(28),
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    contactButton: {
        flex: 1,
        height: scaleVertical(52),
        borderRadius: scale(26),
        borderWidth: 2,
        borderColor: '#064E3B',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    contactButtonText: {
        color: '#064E3B',
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_700Bold',
    },
    bookButton: {
        flex: 1,
        height: scaleVertical(52),
        borderRadius: scale(26),
        backgroundColor: '#064E3B',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    bookButtonText: {
        color: '#FFF',
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_700Bold',
    },
    pickerOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    pickerSheet: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: BorderRadius.xxl,
        borderTopRightRadius: BorderRadius.xxl,
        padding: Spacing.xxxl,
        paddingBottom: scaleVertical(40),
    },
    pickerTitle: {
        fontSize: FontSizes.h4,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        textAlign: 'center',
        marginBottom: Spacing.verticalMd,
    },
    pickerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.verticalMd,
        paddingHorizontal: Spacing.lg,
        backgroundColor: '#F8F9FB',
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.verticalMd,
    },
    pickerItemTitle: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        textAlign: 'right',
    },
    pickerPrice: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_600SemiBold',
        color: '#064E3B',
    },
    pickerCancel: {
        marginTop: Spacing.verticalXs,
        paddingVertical: Spacing.verticalMd,
        alignItems: 'center',
    },
    pickerCancelText: {
        fontSize: FontSizes.label,
        fontFamily: 'Cairo_600SemiBold',
        color: '#EF4444',
    },
});
