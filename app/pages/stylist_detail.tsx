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

const { width } = Dimensions.get('window');

export default function StylistDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.stylistDetail || (pageData as any)['en'].stylistDetail;
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
        { id: 'about', label: content.about || 'عن المنسقة' },
        { id: 'reviews', label: content.reviews || 'التقييمات' },
        { id: 'portfolio', label: content.portfolio || 'معرض الأعمال' },
        { id: 'services', label: content.services || 'الخدمات' },
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

        // If no service given and multiple available → show picker
        if (!service && availableServices.length > 1) {
            setShowServicePicker(true);
            return;
        }

        const selectedService = service ?? availableServices[0];
        if (!selectedService) {
            Alert.alert('لا توجد خدمات', 'لا توجد خدمات متاحة لهذه المنسقة حالياً.');
            return;
        }

        setBooking(true);
        try {
            // Step 1 – create the order
            const orderRes = await apiService.createOrder({
                stylist_service_id: Number(selectedService.id),
            });
            const order = (orderRes?.data as any) ?? orderRes;
            const orderId = order?.id;

            if (!orderId) throw new Error('Order ID missing from response');

            // Step 2 – initiate Moyasar payment and get the hosted payment URL
            const payRes = await apiService.initiatePayment(Number(orderId));
            const paymentUrl = (payRes?.data as any)?.payment_url;

            if (!paymentUrl) throw new Error('payment_url missing from response');

            // Step 3 – open the Moyasar-hosted payment page
            const supported = await Linking.canOpenURL(paymentUrl);
            if (supported) {
                await Linking.openURL(paymentUrl);
            } else {
                Alert.alert('خطأ', 'تعذّر فتح صفحة الدفع.');
            }
        } catch (error: any) {
            console.error('Book & Pay error:', error);
            Alert.alert('خطأ', error?.message || 'تعذّر إتمام الحجز. يرجى المحاولة لاحقاً.');
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
                <Text style={styles.headerTitle}>{content.title || 'تفاصيل المنسقة'}</Text>
                <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerIconButton}>
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={24}
                        color={isFavorite ? "#E11D48" : "#333"}
                    />
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Image */}
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
                            <Text style={styles.priceText}>{stylist.price} ر.س / ساعة</Text>
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

                {/* Tab Content */}
                <View style={styles.tabContent}>
                    {activeTab === 'about' && (
                        <Text style={styles.aboutText}>
                            {stylist?.about ?? 'لا توجد معلومات متاحة'}
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
                            <Text style={styles.noDataText}>لا توجد تقييمات بعد</Text>
                        </View>
                    )}

                    {activeTab === 'services' && (
                        <View style={styles.servicesGrid}>
                            {services.length > 0 ? (
                                services.map((service) => (
                                    <ServiceCard key={String(service.id)} item={service} />
                                ))
                            ) : (
                                <Text style={styles.noDataText}>لا توجد خدمات متاحة</Text>
                            )}
                        </View>
                    )}
                </View>

                {/* Bottom spacing */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Contact + Book Footer */}
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

            {/* Service Picker Modal */}
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
                                <Text style={styles.pickerPrice}>{svc.price} ر.س</Text>
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
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    headerIconButton: {
        width: 40,
        height: 40,
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerImageContainer: {
        height: 280,
        width: '100%',
    },
    headerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    infoContainer: {
        padding: 20,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    nameText: {
        fontSize: 22,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    priceText: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
    specialtyText: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
        marginBottom: 15,
        textAlign: 'right',
    },
    statsRow: {
        gap: 8,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statText: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
    },
    tabsContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    tabsScroll: {
        paddingHorizontal: 20,
    },
    tab: {
        paddingVertical: 15,
        marginRight: 25,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#064E3B',
    },
    tabText: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#999',
    },
    activeTabText: {
        color: '#064E3B',
    },
    tabContent: {
        padding: 20,
    },
    aboutText: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#444',
        lineHeight: 24,
        textAlign: 'right',
    },
    portfolioGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    portfolioImage: {
        width: (width - 50) / 2,
        height: 180,
        borderRadius: 12,
    },
    reviewsContainer: {
        gap: 15,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    serviceCard: {
        width: (width - 52) / 2,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 15,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    serviceIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        alignSelf: 'flex-end',
    },
    serviceContent: {
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    serviceTitle: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
        textAlign: 'right',
    },
    serviceSubtitle: {
        fontSize: 11,
        fontFamily: 'Cairo_400Regular',
        color: '#888',
        textAlign: 'right',
    },
    servicePriceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        alignSelf: 'flex-start',
        gap: 4,
    },
    servicePriceText: {
        fontSize: 13,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
    noDataText: {
        fontFamily: 'Cairo_400Regular',
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        paddingVertical: 20,
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
        top: 0, left: 0, right: 0, bottom: 0,
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
        textAlign: 'right',
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
});
