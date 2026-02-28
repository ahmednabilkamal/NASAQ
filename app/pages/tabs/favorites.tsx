import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '@/components/BottomNav';
import StylistCard from '@/components/home/StylistCard';

// Sample data for favorite stylists
const FAVORITE_STYLISTS = [
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
        name: 'داليا فؤاد',
        rating: 4.9,
        clientCount: 66,
        tags: ['ستايل', 'كاجوال', 'كلاسيكي'],
        image: require('@/assets/stylewomen3.png'),
    },
];

export default function FavoritesScreen() {
    const router = useRouter();
    const [favorites, setFavorites] = useState(FAVORITE_STYLISTS);

    const handleStylistPress = (stylistId: string) => {
        router.push(`/pages/stylist_detail?id=${stylistId}` as any);
    };

    const handleRemoveFavorite = (stylistId: string) => {
        setFavorites(favorites.filter(s => s.id !== stylistId));
    };

    const renderStylist = ({ item }: { item: typeof FAVORITE_STYLISTS[0] }) => (
        <View style={styles.cardWrapper}>
            <StylistCard
                name={item.name}
                imageUri={item.image}
                rating={item.rating}
                clientCount={item.clientCount}
                tags={item.tags}
                onPress={() => handleStylistPress(item.id)}
                isFavorite={true}
                onFavoriteToggle={() => handleRemoveFavorite(item.id)}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-forward" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>المفضلة</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Favorites Grid */}
            {favorites.length > 0 ? (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id}
                    renderItem={renderStylist}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="heart-outline" size={80} color="#DDD" />
                    <Text style={styles.emptyText}>لا توجد مفضلة حتى الآن</Text>
                    <Text style={styles.emptySubtext}>
                        ابدأ بإضافة منسقات إلى قائمة المفضلة
                    </Text>
                </View>
            )}

            <BottomNav />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    placeholder: {
        width: 40,
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    cardWrapper: {
        width: '48%',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
        marginTop: 20,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
});
