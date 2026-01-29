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

export default function StylistDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.stylistDetail || (pageData as any)['en'].stylistDetail;
    const isRTL = I18nManager.isRTL;

    const [activeTab, setActiveTab] = useState('about');

    const Tabs = [
        { id: 'about', label: content.about },
        { id: 'portfolio', label: content.portfolio },
        { id: 'reviews', label: content.reviews },
        { id: 'services', label: content.services },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ProfileBar />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.headerImageContainer}>
                    <Image
                        source={require('@/assets/page1bg.png')}
                        style={styles.headerImage}
                    />

                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <Text style={styles.nameText}>داليا فؤاد</Text>
                        <Text style={styles.priceText}>100 ر.س / {content.hour}</Text>
                    </View>
                    <Text style={styles.specialtyText}>(أسلوب راقٍ يليق بكل مناسبة)</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="briefcase-outline" size={16} color="#999" />
                            <Text style={styles.statText}>{content.experience}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={styles.statText}>4.9 (استايل كاجوال | كلاسيك | محتشم)</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.tabsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
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
                            نقدم حلول تنسيق ملائمة تناسب مختلف المناسبات، مع اهتمام دقيق بكافة التفاصيل وجودة الاختيار. استشاري خبيرة الموضة ومنسقة أزياء متميزة تفهم احتياجات المرأة العصرية وأنماط حياتها المختلفة، تعتمد على رؤية احترافية لتجمع بين أحدث الصيحات والهوية الشخصية، مع الحرص على اختيار الأقمشة والخامات التي تمنح الراحة والأناقة في آن واحد.
                        </Text>
                    )}
                    {activeTab === 'portfolio' && (
                        <View style={styles.portfolioGrid}>
                            <Image source={require('@/assets/page1bg.png')} style={styles.portfolioImage} />
                            <Image source={require('@/assets/page2bg.png')} style={styles.portfolioImage} />
                            <Image source={require('@/assets/page3bg.png')} style={styles.portfolioImage} />
                            <Image source={require('@/assets/page1bg.png')} style={styles.portfolioImage} />
                        </View>
                    )}
                    {activeTab === 'services' && (
                        <View style={styles.servicesGrid}>
                            <View style={styles.serviceItem}>
                                <Text style={styles.serviceName}>طقم واحد</Text>
                                <Text style={styles.servicePrice}>350 ﷼</Text>
                            </View>
                            <View style={styles.serviceItem}>
                                <Text style={styles.serviceName}>مناسبة خاصة</Text>
                                <Text style={styles.servicePrice}>350 ﷼</Text>
                            </View>
                            <View style={styles.serviceItem}>
                                <Text style={styles.serviceName}>خزانة كاملة</Text>
                                <Text style={styles.servicePrice}>350 ﷼</Text>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>


        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    headerImageContainer: {
        height: 300,
        width: '100%',
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    favoriteButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
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
    servicesGrid: {
        gap: 15,
    },
    serviceItem: {
        padding: 15,
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    serviceName: {
        fontSize: 15,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
    },
    servicePrice: {
        fontSize: 15,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    footer: {
        padding: 20,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    connectButton: {
        backgroundColor: '#064E3B',
        height: 55,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    connectButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
    },
});
