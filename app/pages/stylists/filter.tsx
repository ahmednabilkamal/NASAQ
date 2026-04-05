import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { userScreenDirection } from '@/config/rtlLayout';
import apiService, { Category, Stylist } from '@/config/apiService';
import { clearStylistFilters, defaultStylistFilters, loadStylistFilters, saveStylistFilters } from '@/config/stylistFilters';
import SaudiRiyalSymbol from '@/components/SaudiRiyalSymbol';

export default function FilterScreen() {
    const router = useRouter();
    const { q } = useLocalSearchParams<{ q?: string }>();

    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(720);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [baseStylists, setBaseStylists] = useState<Stylist[]>([]);
    const [loadingBaseStylists, setLoadingBaseStylists] = useState(true);

    const searchQuery = useMemo(() => {
        const s = q != null ? String(q).trim() : '';
        return s.length > 0 ? s : undefined;
    }, [q]);

    const categoryIdsParam = useMemo(
        () => (selectedCategoryIds.length > 0 ? selectedCategoryIds.join(',') : undefined),
        [selectedCategoryIds]
    );

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            const stored = await loadStylistFilters();
            if (!mounted) return;
            setMinPrice(stored.minPrice);
            setMaxPrice(stored.maxPrice);
            setSelectedCategoryIds(stored.selectedCategoryIds);
        };

        const loadCategories = async () => {
            try {
                setLoadingCategories(true);
                const res = await apiService.getCategories();
                const data = res?.data;
                if (!mounted) return;
                setCategories(Array.isArray(data) ? data : []);
            } catch {
                if (!mounted) return;
                setCategories([]);
            } finally {
                if (!mounted) return;
                setLoadingCategories(false);
            }
        };

        load();
        loadCategories();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const loadBaseStylists = async () => {
            try {
                setLoadingBaseStylists(true);
                const res = await apiService.getStylists({
                    per_page: 20,
                    search: searchQuery,
                    ...(categoryIdsParam ? { category_ids: categoryIdsParam } : {}),
                });
                const data = res?.data;
                if (!mounted) return;
                setBaseStylists(Array.isArray(data) ? data : []);
            } catch {
                if (!mounted) return;
                setBaseStylists([]);
            } finally {
                if (!mounted) return;
                setLoadingBaseStylists(false);
            }
        };

        loadBaseStylists();
        return () => {
            mounted = false;
        };
    }, [searchQuery, categoryIdsParam]);

    const getCategoryKey = (cat: Category) => String(cat.id);

    const toggleCategory = (key: string) => {
        setSelectedCategoryIds((prev) =>
            prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
        );
    };

    const applyFilters = async () => {
        await saveStylistFilters({
            minPrice,
            maxPrice,
            selectedCategoryIds,
        });
        router.back();
    };

    const clearFilters = async () => {
        await clearStylistFilters();
        setMinPrice(defaultStylistFilters.minPrice);
        setMaxPrice(defaultStylistFilters.maxPrice);
        setSelectedCategoryIds([]);
        router.back();
    };

    const sliderMin = 0;
    const sliderMax = 720;
    const safeMin = Math.max(sliderMin, Math.min(minPrice, maxPrice));
    const safeMax = Math.min(sliderMax, Math.max(minPrice, maxPrice));
    const minPercent = ((safeMin - sliderMin) / (sliderMax - sliderMin)) * 100;
    const maxPercent = ((safeMax - sliderMin) / (sliderMax - sliderMin)) * 100;
    const fillLeftPercent = minPercent;
    const fillWidthPercent = maxPercent - minPercent;

    const toNumber = (value: unknown): number | null => {
        if (value == null) return null;
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
    };

    const priceFilterActive =
        minPrice !== defaultStylistFilters.minPrice || maxPrice !== defaultStylistFilters.maxPrice;
    const categoryFilterActive = selectedCategoryIds.length > 0;

    const getServicePrices = (s: any): number[] => {
        const services = Array.isArray(s?.services) ? s.services : [];
        return services
            .map((svc: any) => toNumber(svc?.price))
            .filter((n: number | null): n is number => n != null);
    };

    const matchesPriceRange = (s: any): boolean => {
        const servicePrices = getServicePrices(s);
        if (servicePrices.length > 0) {
            return servicePrices.some((p) => p >= minPrice && p <= maxPrice);
        }

        const fallbackPrice = toNumber(s?.price);
        if (fallbackPrice == null) return false;
        return fallbackPrice >= minPrice && fallbackPrice <= maxPrice;
    };

    const categorySet = useMemo(() => new Set(selectedCategoryIds), [selectedCategoryIds]);

    const matchesCategory = (s: any): boolean => {
        const services = Array.isArray(s?.services) ? s.services : [];
        return services.some((svc: any) => {
            const cid = svc?.category_id != null ? String(svc.category_id) : '';
            const nested = svc?.category?.id != null ? String(svc.category.id) : '';
            return categorySet.has(cid) || categorySet.has(nested);
        });
    };

    const matchingCount = baseStylists.filter((s: any) => {
        if (priceFilterActive && !matchesPriceRange(s)) return false;
        if (categoryFilterActive && !matchesCategory(s)) return false;
        return true;
    }).length;

    return (
        <SafeAreaView style={[styles.container, userScreenDirection]}>
            <View style={styles.handle} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>فلتر المنسقات</Text>
                <Text style={styles.headerSubtitle}>التصنيفات والميزانية</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>نطاق السعر</Text>

                    <View style={styles.priceRow}>
                        <View style={styles.priceInputWrapper}>
                            <Text style={styles.priceLabel}>من</Text>
                            <View style={styles.priceInput}>
                                <TextInput
                                    style={styles.textInput}
                                    value={minPrice.toString()}
                                    onChangeText={(v) => setMinPrice(Number(v) || 0)}
                                    keyboardType="numeric"
                                    textAlign="right"
                                />
                                <SaudiRiyalSymbol size={16} color="#064E3B" />
                            </View>
                        </View>

                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderTrack}>
                                <View
                                    style={[
                                        styles.sliderFill,
                                        {
                                            left: `${fillLeftPercent}%`,
                                            width: `${fillWidthPercent}%`,
                                        },
                                    ]}
                                />
                                <View style={[styles.sliderThumb, { left: `${minPercent}%` }]} />
                                <View style={[styles.sliderThumb, { left: `${maxPercent}%` }]} />
                            </View>
                        </View>

                        <View style={styles.priceInputWrapper}>
                            <Text style={styles.priceLabel}>إلى</Text>
                            <View style={styles.priceInput}>
                                <TextInput
                                    style={styles.textInput}
                                    value={maxPrice.toString()}
                                    onChangeText={(v) => setMaxPrice(Number(v) || 0)}
                                    keyboardType="numeric"
                                    textAlign="right"
                                />
                                <SaudiRiyalSymbol size={16} color="#064E3B" />
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>التصنيفات</Text>

                    <View style={styles.chipsGrid}>
                        {loadingCategories ? (
                            <View style={styles.chipsLoading}>
                                <ActivityIndicator size="small" color="#064E3B" />
                            </View>
                        ) : categories.length === 0 ? (
                            <Text style={styles.chipsEmptyText}>لا توجد تصنيفات متاحة</Text>
                        ) : (
                            categories.map((cat) => {
                                const key = getCategoryKey(cat);
                                const isSelected = selectedCategoryIds.includes(key);
                                return (
                                    <TouchableOpacity
                                        key={key}
                                        style={[styles.chip, isSelected && styles.chipActive]}
                                        onPress={() => toggleCategory(key)}
                                        activeOpacity={0.85}
                                    >
                                        <Text
                                            style={[styles.chipText, isSelected && styles.chipTextActive]}
                                            numberOfLines={2}
                                        >
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.applyButton} onPress={applyFilters} activeOpacity={0.9}>
                    <Text style={styles.applyButtonText}>
                        {loadingBaseStylists ? 'جاري التحميل…' : `عرض ${matchingCount} منسّق مطابق`}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.clearButton} onPress={clearFilters} activeOpacity={0.9}>
                    <Text style={styles.clearButtonText}>مسح كل الفلاتر</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    handle: {
        width: 50,
        height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 10,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignSelf: 'stretch',
        alignItems: 'stretch',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        marginBottom: 5,
        textAlign: 'left',
    },
    headerSubtitle: {
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        textAlign: 'left',
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: 'Cairo_600SemiBold',
        color: '#999',
        marginBottom: 15,
        textAlign: 'left',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    priceInputWrapper: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
        textAlign: 'left',
        marginBottom: 8,
    },
    priceInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        height: 50,
        paddingHorizontal: 12,
        justifyContent: 'center',
        gap: 8,
    },
    textInput: {
        flex: 1,
        fontFamily: 'Cairo_700Bold',
        fontSize: 18,
        color: '#333',
        minWidth: 40,
        paddingVertical: 0,
    },
    sliderContainer: {
        flex: 0.8,
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    sliderTrack: {
        height: 4,
        backgroundColor: '#E8E8E8',
        borderRadius: 2,
        position: 'relative',
    },
    sliderFill: {
        position: 'absolute',
        height: 4,
        backgroundColor: '#064E3B',
        borderRadius: 2,
    },
    sliderThumb: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#064E3B',
        top: -6,
    },
    chipsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'flex-start',
    },
    chipsLoading: {
        paddingVertical: 10,
        width: '100%',
        alignItems: 'center',
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        backgroundColor: '#FFF',
        maxWidth: '100%',
    },
    chipActive: {
        backgroundColor: '#064E3B',
        borderColor: '#064E3B',
    },
    chipText: {
        fontSize: 13,
        fontFamily: 'Cairo_600SemiBold',
        color: '#333',
        textAlign: 'center',
    },
    chipTextActive: {
        color: '#FFF',
    },
    chipsEmptyText: {
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#9CA3AF',
        paddingVertical: 8,
        textAlign: 'left',
        width: '100%',
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 30,
        paddingTop: 10,
        gap: 12,
    },
    applyButton: {
        backgroundColor: '#064E3B',
        height: 55,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        textAlign: 'center',
    },
    clearButton: {
        height: 55,
        borderRadius: 28,
        borderWidth: 1.5,
        borderColor: '#064E3B',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    clearButtonText: {
        color: '#064E3B',
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        textAlign: 'center',
    },
});
