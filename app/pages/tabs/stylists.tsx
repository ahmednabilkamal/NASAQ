import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    Dimensions,
    I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import BottomNav from '@/components/BottomNav';

const { width } = Dimensions.get('window');

const MOCK_STYLISTS = [
    { id: '1', name: 'داليا فؤاد', specialty: 'استايل كاجوال | كلاسيك | محتشم', price: '66', rating: '4.9', image: require('@/assets/page1bg.png') },
    { id: '2', name: 'داليا فؤاد', specialty: 'استايل كاجوال | كلاسيك | محتشم', price: '66', rating: '4.9', image: require('@/assets/page2bg.png') },
    { id: '3', name: 'داليا فؤاد', specialty: 'استايل كاجوال | كلاسيك | محتشم', price: '66', rating: '4.9', image: require('@/assets/page3bg.png') },
    { id: '4', name: 'داليا فؤاد', specialty: 'استايل كاجوال | كلاسيك | محتشم', price: '66', rating: '4.9', image: require('@/assets/page1bg.png') },
];

export default function StylistsScreen() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.stylistsList || (pageData as any)['en'].stylistsList;
    const isRTL = I18nManager.isRTL;

    const [search, setSearch] = useState('');

    const StylistCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/pages/stylist_detail', params: { id: item.id } } as any)}
        >
            <View style={styles.imageContainer}>
                <Image source={item.image} style={styles.stylistImage} />
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
                <TouchableOpacity style={styles.favoriteButton}>
                    <Ionicons name="heart" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>
            <View style={styles.cardInfo}>
                <View style={styles.nameRow}>
                    <Text style={styles.stylistName}>{item.name}</Text>
                    <Text style={styles.priceText}>{item.price} ﷼</Text>
                </View>
                <Text style={styles.stylistSpecialty} numberOfLines={1}>{item.specialty}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{content.title}</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={content.searchPlaceholder}
                        value={search}
                        onChangeText={setSearch}
                        textAlign={isRTL ? 'right' : 'left'}
                    />
                </View>
                <TouchableOpacity style={styles.filterButton} onPress={() => router.push('/pages/stylists/filter' as any)}>
                    <Ionicons name="options-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1, justifyContent: 'center' }}>
                <FlatList
                    data={MOCK_STYLISTS}
                    horizontal
                    pagingEnabled
                    snapToAlignment="center"
                    snapToInterval={width - 50}
                    decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <StylistCard item={item} />}
                    contentContainerStyle={styles.listContent}
                />
            </View>
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
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    searchSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 20,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Cairo_400Regular',
        fontSize: 14,
    },
    filterButton: {
        width: 50,
        height: 50,
        backgroundColor: '#FFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    listContent: {
        paddingHorizontal: 25,
        paddingTop: 10,
        paddingBottom: 100,
        height:200
    },
    card: {
        width: 300,
        height:width * 0.7,
        marginRight: 20,
        backgroundColor: '#FFF',
        borderRadius: 25,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 8,
        // height: width * 1.1,
    },
    imageContainer: {
        flex: 1,
        position: 'relative',
    },
    stylistImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    ratingBadge: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'rgba(255,255,255,0.95)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    ratingText: {
        color: '#000',
        fontSize: 12,
        fontFamily: 'Cairo_700Bold',
    },
    favoriteButton: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    cardInfo: {
        padding: 25,
        backgroundColor: '#FFF',
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    stylistName: {
        fontSize: 20,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    priceText: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
    stylistSpecialty: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        textAlign: I18nManager.isRTL ? 'right' : 'left',
    },
});
