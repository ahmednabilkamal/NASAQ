import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '@/components/BottomNav';
import StylistCard from '@/components/home/StylistCard';
import { useAuth } from '@/config/authContext';
import apiService, { Stylist } from '@/config/apiService';
import { getBackChevron } from '@/config/directionalIcons';

export default function FavoritesScreen() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/pages/login');
        }
    }, [isAuthenticated, authLoading]);
    const [favorites, setFavorites] = useState<Stylist[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const res = await apiService.getFavorites();
            setFavorites(res.data || []);
        } catch (error) {
            console.error('Fetch favorites error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const handleStylistPress = (stylistId: number | string) => {
        router.push(`/pages/stylist_detail?id=${stylistId}` as any);
    };

    const handleRemoveFavorite = async (stylistId: number | string) => {
        try {
            await apiService.toggleFavorite(stylistId);
            setFavorites(prev => prev.filter(s => String(s.id) !== String(stylistId)));
        } catch (error) {
            console.error('Remove favorite error:', error);
        }
    };

    const renderStylist = ({ item }: { item: Stylist }) => {
        const id = String(item.id);
        const tags = item.fashion_styles?.map((s: any) => s.name) ?? [];

        return (
            <View style={styles.cardWrapper}>
                <StylistCard
                    name={item.name}
                    subtitle={item.bio}
                    imageUri={item.image ? { uri: item.image } : null}
                    rating={typeof item.rating === 'number' ? item.rating : parseFloat(String(item.rating ?? '0'))}
                    clientCount={Number(item.clients_count ?? 0)}
                    tags={tags}
                    onPress={() => handleStylistPress(item.id)}
                    isFavorite={true}
                    onFavoriteToggle={() => handleRemoveFavorite(item.id)}
                />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name={getBackChevron()} size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>المفضلة</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Favorites Grid */}
            {loading ? (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#064E3B" />
                </View>
            ) : favorites.length > 0 ? (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => String(item.id)}
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
