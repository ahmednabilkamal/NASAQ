import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/config/authContext';
import { HomeHeader, HeroBanner, StylistCard, ServicePackageCard } from '@/components/home';

// Sample data for stylists
const STYLISTS_DATA = [
    {
        id: '1',
        name: 'داليا فؤاد',
        rating: 4.9,
        clientCount: 66,
        tags: ['ستايل', 'كاجوال', 'كلاسيكي'],
        image: require('@/assets/stylewomen1.png'),
    },
    {
        id: '2',
        name: 'داليا فؤاد',
        rating: 4.9,
        clientCount: 66,
        tags: ['ستايل', 'كاجوال', 'كلاسيكي', 'محتشم'],
        image: require('@/assets/stylewomen2.png'),
    },
    {
        id: '3',
        name: 'سارة أحمد',
        rating: 4.8,
        clientCount: 45,
        tags: ['عصري', 'رسمي', 'سهرات'],
        image: require('@/assets/stylewomen3.png'),
    },
];

// Sample data for service packages
const PACKAGES_DATA = [
    {
        id: '1',
        title: 'طقم واحد',
        subtitle: 'ملابس 24 ساعة',
        price: 350,
        icon: 'shirt-outline' as const,
        featured: true,
    },
    {
        id: '2',
        title: 'مناسبة خاصة',
        subtitle: 'ملابس 24 ساعة',
        price: 350,
        icon: 'sparkles-outline' as const,
        featured: false,
    },
    {
        id: '3',
        title: 'خزانة كاملة',
        subtitle: 'ملابس 24 ساعة',
        price: 350,
        icon: 'cube-outline' as const,
        featured: false,
    },
];

const HomeScreen = () => {
    const { user } = useAuth();
    const router = useRouter();

    const handleStylistPress = (stylistId: string) => {
        router.push(`/pages/stylist_detail?id=${stylistId}` as any);
    };

    const handlePackagePress = (packageId: string) => {
        // Handle package selection
        console.log('Package pressed:', packageId);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <HomeHeader
                userName={user?.name || 'نور حسن'}
                greeting="صباح الخير"
                onSearchPress={() => console.log('Search pressed')}
                onNotificationPress={() => router.push('/pages/notifications' as any)}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Banner */}
                <HeroBanner
                    title="اختيار الفئة المناسبة لجسمك بفرق أكثر من القطعة نفسها."
                    subtitle=""
                    buttonText="عرض الكل"
                    imageUri={require('@/assets/stylewomen1.png')}
                    onPress={() => console.log('Banner pressed')}
                />

                {/* Expert Stylists Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLink}>عرض الكل</Text>
                        <Text style={styles.sectionTitle}>منسقات بيق بون الخبير</Text>
                    </View>

                    <FlatList
                        data={STYLISTS_DATA}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        inverted
                        contentContainerStyle={styles.stylistsList}
                        renderItem={({ item }) => (
                            <StylistCard
                                name={item.name}
                                imageUri={item.image}
                                rating={item.rating}
                                clientCount={item.clientCount}
                                tags={item.tags}
                                onPress={() => handleStylistPress(item.id)}
                            />
                        )}
                    />
                </View>

                {/* Service Packages Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLink}></Text>
                        <Text style={styles.sectionTitle}>باقات مصممة لاحتياجاتك</Text>
                    </View>

                    <View style={styles.packagesContainer}>
                        {PACKAGES_DATA.map((pkg) => (
                            <ServicePackageCard
                                key={pkg.id}
                                title={pkg.title}
                                subtitle={pkg.subtitle}
                                price={pkg.price}
                                icon={pkg.icon}
                                featured={pkg.featured}
                                onPress={() => handlePackagePress(pkg.id)}
                            />
                        ))}
                    </View>
                </View>

                {/* Bottom spacing for BottomNav */}
                <View style={styles.bottomSpacer} />
            </ScrollView>

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
    packagesContainer: {
        paddingHorizontal: 20,
    },
    bottomSpacer: {
        height: 80,
    },
});
