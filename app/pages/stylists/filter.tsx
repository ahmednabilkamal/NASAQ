import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiService, { FashionStyle, Stylist } from '@/config/apiService';
import { clearStylistFilters, defaultStylistFilters, loadStylistFilters, saveStylistFilters } from '@/config/stylistFilters';

export default function FilterScreen() {
    const router = useRouter();
    const { q } = useLocalSearchParams<{ q?: string }>();

    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(720);
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [fashionStyles, setFashionStyles] = useState<FashionStyle[]>([]);
    const [loadingStyles, setLoadingStyles] = useState(true);
    const [baseStylists, setBaseStylists] = useState<Stylist[]>([]);
    const [loadingBaseStylists, setLoadingBaseStylists] = useState(true);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            const stored = await loadStylistFilters();
            if (!mounted) return;
            setMinPrice(stored.minPrice);
            setMaxPrice(stored.maxPrice);
            setSelectedStyles(stored.selectedStyleIds);
        };

        const loadStyles = async () => {
            try {
                setLoadingStyles(true);
                const res = await apiService.getFashionStyles({ per_page: 50 });
                const data = res?.data;
                if (!mounted) return;
                setFashionStyles(Array.isArray(data) ? data : []);
            } catch {
                if (!mounted) return;
                setFashionStyles([]);
            } finally {
                if (!mounted) return;
                setLoadingStyles(false);
            }
        };

        load();
        loadStyles();
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
                    search: q ? String(q).trim() : undefined,
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
    }, [q]);

    const fallbackStyles: FashionStyle[] = [
        { id: '1', name: 'مناسبات' },
        { id: '2', name: 'استايل رسمي' },
        { id: '3', name: 'سهرة' },
        { id: '4', name: 'أزياء عصرية' },
        { id: '5', name: 'خزانة كاملة' },
        { id: '6', name: 'كاجوال' },
    ];

    const stylesList = fashionStyles.length > 0 ? fashionStyles : fallbackStyles;

    const getStyleKey = (style: FashionStyle) => {
        const idKey = style.id != null ? String(style.id) : '';
        const nameKey = style.name != null ? String(style.name) : '';
        return idKey || nameKey;
    };

    const toggleStyle = (styleKey: string) => {
        if (selectedStyles.includes(styleKey)) {
            setSelectedStyles(selectedStyles.filter((s) => s !== styleKey));
        } else {
            setSelectedStyles([...selectedStyles, styleKey]);
        }
    };

    const applyFilters = async () => {
        await saveStylistFilters({
            minPrice,
            maxPrice,
            selectedStyleIds: selectedStyles,
        });
        router.back();
    };

    const clearFilters = async () => {
        await clearStylistFilters();
        setMinPrice(defaultStylistFilters.minPrice);
        setMaxPrice(defaultStylistFilters.maxPrice);
        setSelectedStyles([]);
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
    const styleFilterActive = selectedStyles.length > 0;

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

    const matchingCount = baseStylists.filter((s: any) => {
        if (priceFilterActive && !matchesPriceRange(s)) return false;

        if (styleFilterActive) {
            const styleSet = new Set(selectedStyles);
            const hasMatch = (s.fashion_styles ?? []).some((fs: any) => {
                const name = String(fs?.name ?? '');
                const id = fs?.id != null ? String(fs.id) : '';
                return styleSet.has(name) || styleSet.has(id);
            });
            if (!hasMatch) return false;
        }

        return true;
    }).length;

    return (
        <SafeAreaView style={styles.container}>
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>فلتر المنسقات</Text>
                <Text style={styles.headerSubtitle}>أعرض المنسقات ضمن ميزانيتك</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Price Range Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>نطاق السعر</Text>

                    <View style={styles.priceRow}>
                        {/* To (visually on left in RTL due to row-reverse) */}
                        <View style={styles.priceInputWrapper}>
                            <Text style={styles.priceLabel}>إلى</Text>
                            <View style={styles.priceInput}>
                                <Text style={styles.currency}>ر.س</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={maxPrice.toString()}
                                    onChangeText={(v) => setMaxPrice(Number(v) || 0)}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        {/* Slider in middle */}
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
                                <View
                                    style={[
                                        styles.sliderThumb,
                                        { left: `${minPercent}%` },
                                    ]}
                                />
                                <View
                                    style={[
                                        styles.sliderThumb,
                                        { left: `${maxPercent}%` },
                                    ]}
                                />
                            </View>
                        </View>

                        {/* From (visually on right in RTL due to row-reverse) */}
                        <View style={styles.priceInputWrapper}>
                            <Text style={styles.priceLabel}>من</Text>
                            <View style={styles.priceInput}>
                                <Text style={styles.currency}>ر.س</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={minPrice.toString()}
                                    onChangeText={(v) => setMinPrice(Number(v) || 0)}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Style Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>: الأستايل</Text>

                    <View style={styles.stylesGrid}>
                        {loadingStyles ? (
                            <View style={{ paddingVertical: 10 }}>
                                <ActivityIndicator size="small" color="#064E3B" />
                            </View>
                        ) : (
                            stylesList.map((style) => {
                            const key = getStyleKey(style);
                            const isSelected = selectedStyles.includes(key);
                            return (
                                <TouchableOpacity
                                    key={key}
                                    style={[
                                        styles.styleChip,
                                        isSelected && styles.styleChipActive,
                                    ]}
                                    onPress={() => toggleStyle(key)}
                                >
                                    <Text
                                        style={[
                                            styles.styleText,
                                            isSelected && styles.styleTextActive,
                                        ]}
                                    >
                                        {style.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.applyButton}
                    onPress={applyFilters}
                >
                    <Text style={styles.applyButtonText}>
                        شاهد {loadingBaseStylists ? '...' : matchingCount} منسقة مطابقة
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearFilters}
                >
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
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
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
        textAlign: 'right',
    },
    priceRow: {
        flexDirection: 'row-reverse',
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
        textAlign: 'center',
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
    },
    currency: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        marginRight: 5,
    },
    textInput: {
        fontFamily: 'Cairo_700Bold',
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
        minWidth: 50,
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
    stylesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'flex-start',
    },
    styleChip: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        backgroundColor: '#FFF',
    },
    styleChipActive: {
        backgroundColor: '#064E3B',
        borderColor: '#064E3B',
    },
    styleText: {
        fontSize: 13,
        fontFamily: 'Cairo_600SemiBold',
        color: '#333',
    },
    styleTextActive: {
        color: '#FFF',
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
    },
});
