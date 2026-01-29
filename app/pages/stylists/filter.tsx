import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';

export default function FilterScreen() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.stylistsList || (pageData as any)['en'].stylistsList;
    const isRTL = I18nManager.isRTL;

    const [priceRange, setPriceRange] = useState({ from: '0', to: '720' });
    const [selectedStyle, setSelectedStyle] = useState('Casual');

    const styles_list = ['مناسبات', 'استايل رسمي', 'سهرة', 'أزياء عصرية', 'كاجوال', 'خزانة كاملة'];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.handle} />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{content.filterTitle}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{content.filterByPrice}</Text>
                    <View style={styles.priceRow}>
                        <View style={styles.priceInputWrapper}>
                            <Text style={styles.priceLabel}>{content.from}</Text>
                            <View style={styles.priceInput}>
                                <Text style={styles.currency}>﷼</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={priceRange.from}
                                    onChangeText={(v) => setPriceRange({ ...priceRange, from: v })}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                        <View style={styles.priceInputWrapper}>
                            <Text style={styles.priceLabel}>{content.to}</Text>
                            <View style={styles.priceInput}>
                                <Text style={styles.currency}>﷼</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={priceRange.to}
                                    onChangeText={(v) => setPriceRange({ ...priceRange, to: v })}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{content.style}</Text>
                    <View style={styles.stylesGrid}>
                        {styles_list.map((style) => (
                            <TouchableOpacity
                                key={style}
                                style={[styles.styleChip, selectedStyle === style && styles.styleChipActive]}
                                onPress={() => setSelectedStyle(style)}
                            >
                                <Text style={[styles.styleText, selectedStyle === style && styles.styleTextActive]}>
                                    {style}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.applyButton} onPress={() => router.back()}>
                    <Text style={styles.applyButtonText}>{content.applyFilter}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>{content.clearFilter}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        height: '70%',
        bottom: 0,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#EEE',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginTop: 10,
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#999',
        marginBottom: 15,
        textAlign: 'right',
    },
    priceRow: {
        flexDirection: 'row',
        gap: 15,
    },
    priceInputWrapper: {
        flex: 1,
        gap: 8,
    },
    priceLabel: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
        textAlign: 'right',
    },
    priceInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        height: 50,
        paddingHorizontal: 15,
    },
    currency: {
        fontSize: 14,
        color: '#666',
        marginRight: 5,
    },
    textInput: {
        flex: 1,
        fontFamily: 'Cairo_700Bold',
        fontSize: 16,
        textAlign: 'center',
    },
    stylesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'flex-start',
    },
    styleChip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
    },
    styleChipActive: {
        backgroundColor: '#064E3B',
    },
    styleText: {
        fontSize: 12,
        fontFamily: 'Cairo_700Bold',
        color: '#666',
    },
    styleTextActive: {
        color: '#FFF',
    },
    footer: {
        padding: 20,
        paddingBottom: 30,
        gap: 10,
    },
    applyButton: {
        backgroundColor: '#064E3B',
        height: 55,
        borderRadius: 25,
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
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#064E3B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#064E3B',
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
    },
});
