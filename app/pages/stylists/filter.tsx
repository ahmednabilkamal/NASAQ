import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, IconSizes } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';
import { InputSizes, ButtonSizes } from '@/utils/spacing';

export default function FilterScreen() {
    const router = useRouter();

    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(720);
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

    const stylesList = [
        'مناسبات',
        'استايل رسمي',
        'سهرة',
        'أزياء عصرية',
        'خزانة كاملة',
        'كاجوال',
    ];

    const toggleStyle = (style: string) => {
        if (selectedStyles.includes(style)) {
            setSelectedStyles(selectedStyles.filter((s) => s !== style));
        } else {
            setSelectedStyles([...selectedStyles, style]);
        }
    };

    const clearFilters = () => {
        setMinPrice(0);
        setMaxPrice(720);
        setSelectedStyles([]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.handle} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>فلتر المنسقات</Text>
                <Text style={styles.headerSubtitle}>أعرض المنسقات ضمن ميزانيتك</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Price Range</Text>

                    <View style={styles.priceRow}>
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

                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderTrack}>
                                <View style={[styles.sliderFill, { width: `${((maxPrice - minPrice) / 720) * 100}%` }]} />
                                <View style={styles.sliderThumbLeft} />
                                <View style={styles.sliderThumbRight} />
                            </View>
                        </View>

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

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>: الأستايل</Text>

                    <View style={styles.stylesGrid}>
                        {stylesList.map((style) => {
                            const isSelected = selectedStyles.includes(style);
                            return (
                                <TouchableOpacity
                                    key={style}
                                    style={[
                                        styles.styleChip,
                                        isSelected && styles.styleChipActive,
                                    ]}
                                    onPress={() => toggleStyle(style)}
                                >
                                    <Text
                                        style={[
                                            styles.styleText,
                                            isSelected && styles.styleTextActive,
                                        ]}
                                    >
                                        {style}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.applyButtonText}>شاهد 156 منسقة مطابقة</Text>
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
        borderTopLeftRadius: BorderRadius.xxxl,
        borderTopRightRadius: BorderRadius.xxxl,
    },
    handle: {
        width: scale(50),
        height: scale(5),
        backgroundColor: '#E0E0E0',
        borderRadius: BorderRadius.xs,
        alignSelf: 'center',
        marginTop: Spacing.verticalSm,
        marginBottom: Spacing.verticalXs,
    },
    header: {
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingVertical: Spacing.verticalMd,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSizes.h3,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        marginBottom: Spacing.verticalXs,
    },
    headerSubtitle: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
    },
    content: {
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingTop: Spacing.verticalXs,
        paddingBottom: Spacing.verticalMd,
    },
    section: {
        marginBottom: Spacing.verticalXxxl,
    },
    sectionTitle: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_600SemiBold',
        color: '#999',
        marginBottom: Spacing.verticalXl,
        textAlign: 'right',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: Spacing.md,
    },
    priceInputWrapper: {
        flex: 1,
    },
    priceLabel: {
        fontSize: FontSizes.caption,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
        textAlign: 'center',
        marginBottom: Spacing.verticalXs,
    },
    priceInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: BorderRadius.md,
        height: InputSizes.height,
        paddingHorizontal: Spacing.md,
        justifyContent: 'center',
    },
    currency: {
        fontSize: FontSizes.caption,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        marginRight: Spacing.xs,
    },
    textInput: {
        fontFamily: 'Cairo_700Bold',
        fontSize: FontSizes.h4,
        color: '#333',
        textAlign: 'center',
        minWidth: scale(50),
    },
    sliderContainer: {
        flex: 0.8,
        height: InputSizes.height,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xs,
    },
    sliderTrack: {
        height: scale(4),
        backgroundColor: '#E8E8E8',
        borderRadius: BorderRadius.xs,
        position: 'relative',
    },
    sliderFill: {
        position: 'absolute',
        height: scale(4),
        backgroundColor: '#064E3B',
        borderRadius: BorderRadius.xs,
        left: '10%',
    },
    sliderThumbLeft: {
        position: 'absolute',
        width: scale(16),
        height: scale(16),
        borderRadius: BorderRadius.round,
        backgroundColor: '#064E3B',
        top: scale(-6),
        left: '10%',
    },
    sliderThumbRight: {
        position: 'absolute',
        width: scale(16),
        height: scale(16),
        borderRadius: BorderRadius.round,
        backgroundColor: '#064E3B',
        top: scale(-6),
        right: '10%',
    },
    stylesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        justifyContent: 'flex-end',
    },
    styleChip: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.verticalXs,
        borderRadius: BorderRadius.button,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        backgroundColor: '#FFF',
    },
    styleChipActive: {
        backgroundColor: '#064E3B',
        borderColor: '#064E3B',
    },
    styleText: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_600SemiBold',
        color: '#333',
    },
    styleTextActive: {
        color: '#FFF',
    },
    footer: {
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingBottom: Spacing.verticalXxxxl,
        paddingTop: Spacing.verticalXs,
        gap: Spacing.md,
    },
    applyButton: {
        backgroundColor: '#064E3B',
        height: ButtonSizes.heightMedium,
        borderRadius: BorderRadius.button,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#FFF',
        fontSize: FontSizes.bodyLarge,
        fontFamily: 'Cairo_700Bold',
    },
    clearButton: {
        height: ButtonSizes.heightMedium,
        borderRadius: BorderRadius.button,
        borderWidth: 1.5,
        borderColor: '#064E3B',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    clearButtonText: {
        color: '#064E3B',
        fontSize: FontSizes.bodyLarge,
        fontFamily: 'Cairo_700Bold',
    },
});
