import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Dimensions,
    I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import ProfileBar from '@/components/ProfileBar';

const { width } = Dimensions.get('window');

// Service packages data
const SERVICES = [
    {
        id: '1',
        title: 'طقم واحد',
        subtitle: 'ملابس 24 ساعة',
        price: 350,
        featured: true,
    },
    {
        id: '2',
        title: 'مناسبة خاصة',
        subtitle: 'ملابس 24 ساعة',
        price: 350,
        featured: false,
    },
    {
        id: '3',
        title: 'خزانة كاملة',
        subtitle: 'ملابس 24 ساعة',
        price: 350,
        featured: false,
    },
    {
        id: '4',
        title: 'خزانة كاملة',
        subtitle: 'ملابس 24 ساعة',
        price: 350,
        featured: false,
    },
];

export default function StylistDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.stylistDetail || (pageData as any)['en'].stylistDetail;
    const isRTL = I18nManager.isRTL;

    const [activeTab, setActiveTab] = useState('about');

    const Tabs = [
        { id: 'about', label: content.about || 'عن المنسقة' },
        { id: 'reviews', label: content.reviews || 'التقييمات' },
        { id: 'portfolio', label: content.portfolio || 'معرض الأعمال' },
        { id: 'services', label: content.services || 'الخدمات' },
    ];

    const handleContact = () => {
        router.push('/pages/chat' as any);
    };

    const ServiceCard = ({ item }: { item: typeof SERVICES[0] }) => (
        <View style={[styles.serviceCard, item.featured && styles.serviceCardFeatured]}>
            <View style={styles.serviceIconContainer}>
                <Ionicons
                    name="chevron-back"
                    size={18}
                    color={item.featured ? '#FFF' : '#064E3B'}
                />
            </View>
            <View style={styles.serviceContent}>
                <Text style={[styles.serviceTitle, item.featured && styles.serviceTitleFeatured]}>
                    {item.title}
                </Text>
                <Text style={[styles.serviceSubtitle, item.featured && styles.serviceSubtitleFeatured]}>
                    {item.subtitle}
                </Text>
            </View>
            <View style={[styles.servicePriceBadge, item.featured && styles.servicePriceBadgeFeatured]}>
                <Ionicons name="pricetag" size={12} color="#064E3B" />
                <Text style={styles.servicePriceText}>{item.price}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ProfileBar />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Image */}
                <View style={styles.headerImageContainer}>
                    <Image
                        source={require('@/assets/stylewomen1.png')}
                        style={styles.headerImage}
                    />
                </View>

                {/* Info Section */}
                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <Text style={styles.nameText}>داليا فؤاد</Text>
                        <Text style={styles.priceText}>100ر.س / ساعة</Text>
                    </View>
                    <Text style={styles.specialtyText}>(أسلوب راقٍ يليق بكل مناسبة)</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="time-outline" size={16} color="#999" />
                            <Text style={styles.statText}>خبرة أكثر من سنتين</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={styles.statText}>4.5 استايل كاجوال | كلاسيك | محتشم</Text>
                        </View>
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
                            نقدم حلول تنسيق ملائمة تناسب مختلف المناسبات، مع اهتمام دقيق بكافة التفاصيل وجودة الاختيار. استشاري خبيرة الموضة ومنسقة أزياء متميزة تفهم احتياجات المرأة العصرية وأنماط حياتها المختلفة، تعتمد على رؤية احترافية لتجمع بين أحدث الصيحات والهوية الشخصية، مع الحرص على اختيار الأقمشة والخامات التي تمنح الراحة والأناقة في آن واحد.
                        </Text>
                    )}

                    {activeTab === 'portfolio' && (
                        <View style={styles.portfolioGrid}>
                            <Image source={require('@/assets/stylewomen1.png')} style={styles.portfolioImage} />
                            <Image source={require('@/assets/stylewomen2.png')} style={styles.portfolioImage} />
                            <Image source={require('@/assets/stylewomen3.png')} style={styles.portfolioImage} />
                            <Image source={require('@/assets/stylewomen1.png')} style={styles.portfolioImage} />
                        </View>
                    )}

                    {activeTab === 'reviews' && (
                        <View style={styles.reviewsContainer}>
                            <View style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <View style={styles.reviewRating}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Ionicons key={star} name="star" size={14} color="#FFD700" />
                                        ))}
                                    </View>
                                    <Text style={styles.reviewerName}>سارة محمد</Text>
                                </View>
                                <Text style={styles.reviewText}>
                                    خدمة رائعة واختيارات مميزة جداً، أنصح الجميع بالتجربة
                                </Text>
                            </View>
                            <View style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <View style={styles.reviewRating}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Ionicons key={star} name="star" size={14} color={star <= 4 ? "#FFD700" : "#DDD"} />
                                        ))}
                                    </View>
                                    <Text style={styles.reviewerName}>نورة أحمد</Text>
                                </View>
                                <Text style={styles.reviewText}>
                                    تنسيقات جميلة ومتنوعة تناسب جميع المناسبات
                                </Text>
                            </View>
                        </View>
                    )}

                    {activeTab === 'services' && (
                        <View style={styles.servicesGrid}>
                            {SERVICES.map((service) => (
                                <ServiceCard key={service.id} item={service} />
                            ))}
                        </View>
                    )}
                </View>

                {/* Bottom spacing */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Contact Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                    <Text style={styles.contactButtonText}>تواصلي مع المنسقة</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    headerImageContainer: {
        height: 280,
        width: '100%',
        position: 'relative',
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
    reviewCard: {
        backgroundColor: '#F9F9F9',
        padding: 15,
        borderRadius: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    reviewerName: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
    },
    reviewRating: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewText: {
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
        textAlign: 'right',
        lineHeight: 22,
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
    serviceCardFeatured: {
        backgroundColor: '#064E3B',
        borderColor: '#064E3B',
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
    serviceTitleFeatured: {
        color: '#FFF',
    },
    serviceSubtitle: {
        fontSize: 11,
        fontFamily: 'Cairo_400Regular',
        color: '#888',
        textAlign: 'right',
    },
    serviceSubtitleFeatured: {
        color: 'rgba(255,255,255,0.7)',
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
    servicePriceBadgeFeatured: {
        backgroundColor: '#FFF',
    },
    servicePriceText: {
        fontSize: 13,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 30,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    contactButton: {
        backgroundColor: '#064E3B',
        height: 55,
        borderRadius: 27.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
    },
});
