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
                    <Text style={styles.sectionTitle}>Price Range</Text>

                    <View style={styles.priceRow}>
                        {/* To (Left side in RTL) */}
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
                                <View style={[styles.sliderFill, { width: `${((maxPrice - minPrice) / 720) * 100}%` }]} />
                                <View style={styles.sliderThumbLeft} />
                                <View style={styles.sliderThumbRight} />
                            </View>
                        </View>

                        {/* From (Right side in RTL) */}
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

            {/* Footer Buttons */}
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
        left: '10%',
    },
    sliderThumbLeft: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#064E3B',
        top: -6,
        left: '10%',
    },
    sliderThumbRight: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#064E3B',
        top: -6,
        right: '10%',
    },
    stylesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'flex-end',
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
