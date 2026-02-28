import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import BottomNav from '@/components/BottomNav';

const MOCK_STYLISTS = [
    { id: '1', name: 'داليا فؤاد', specialty: 'استايل كاجوال | كلاسيك | محتشم', price: '66', rating: '4.9', image: require('@/assets/stylewomen1.png'), isFavorite: true },
    { id: '2', name: 'سارة أحمد', specialty: 'استايل كاجوال | كلاسيك | محتشم', price: '66', rating: '4.9', image: require('@/assets/stylewomen2.png'), isFavorite: true },
    { id: '3', name: 'نور محمد', specialty: 'استايل كاجوال | كلاسيك | محتشم', price: '66', rating: '4.9', image: require('@/assets/stylewomen3.png'), isFavorite: false },
    { id: '4', name: 'ليلى حسن', specialty: 'استايل كاجوال | كلاسيك | محتشم', price: '66', rating: '4.9', image: require('@/assets/stylewomen1.png'), isFavorite: true },
    { id: '5', name: 'مريم علي', specialty: 'استايل كاجوال | كلاسيك | محتشم', price: '66', rating: '4.9', image: require('@/assets/stylewomen2.png'), isFavorite: false },
];

export default function StylistsScreen() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.stylistsList || (pageData as any)['en'].stylistsList;
    const isRTL = I18nManager.isRTL;

    const [search, setSearch] = useState('');
    const [favorites, setFavorites] = useState<string[]>(
        MOCK_STYLISTS.filter(s => s.isFavorite).map(s => s.id)
    );

    const toggleFavorite = (id: string) => {
        if (favorites.includes(id)) {
            setFavorites(favorites.filter(f => f !== id));
        } else {
            setFavorites([...favorites, id]);
        }
    };

    const StylistCard = ({ item }: { item: any }) => {
        const isFav = favorites.includes(item.id);
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push({ pathname: '/pages/stylist_detail', params: { id: item.id } } as any)}
            >
                <Image source={item.image} style={styles.stylistImage} />

                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={() => toggleFavorite(item.id)}
                        >
                            <Ionicons
                                name={isFav ? "heart" : "heart-outline"}
                                size={22}
                                color={isFav ? "#E11D48" : "#999"}
                            />
                        </TouchableOpacity>
                        <Text style={styles.stylistName}>{item.name}</Text>
                    </View>

                    <Text style={styles.stylistSpecialty} numberOfLines={1}>
                        {item.specialty}
                    </Text>

                    <View style={styles.cardFooter}>
                        <View style={styles.priceContainer}>
                            <Text style={styles.priceText}>{item.price}</Text>
                            <Text style={styles.currencyText}>ر.س</Text>
                        </View>
                        <View style={styles.ratingContainer}>
                            <Text style={styles.ratingText}>{item.rating}</Text>
                            <Ionicons name="star" size={14} color="#FFD700" />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{content.title || 'المنسقات'}</Text>
            </View>

            {/* Search Section */}
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color="#999" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={content.searchPlaceholder || 'بحث'}
                        placeholderTextColor="#999"
                        value={search}
                        onChangeText={setSearch}
                        textAlign="right"
                    />
                </View>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => router.push('/pages/stylists/filter' as any)}
                >
                    <Ionicons name="options-outline" size={22} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Stylists List */}
            <FlatList
                data={MOCK_STYLISTS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <StylistCard item={item} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <BottomNav />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    searchSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 15,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 48,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Cairo_400Regular',
        fontSize: 14,
        color: '#333',
    },
    filterButton: {
        width: 48,
        height: 48,
        backgroundColor: '#FFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
    },
    stylistImage: {
        width: 100,
        height: 100,
        resizeMode: 'cover',
    },
    cardContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stylistName: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
    },
    favoriteButton: {
        padding: 4,
    },
    stylistSpecialty: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        textAlign: 'right',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 13,
        fontFamily: 'Cairo_600SemiBold',
        color: '#333',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    priceText: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
    currencyText: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#064E3B',
    },
});
