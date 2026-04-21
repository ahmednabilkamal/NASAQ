import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { rtlText } from '@/config/rtlText';

type WhyUsItem = {
    id: string;
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
};

const WHY_US_ITEMS: WhyUsItem[] = [
    {
        id: 'trusted',
        title: 'منسقات معتمدات',
        subtitle: 'حسابات موثقة وتقييمات من عميلات حقيقيات',
        icon: 'shield-checkmark-outline',
    },
    {
        id: 'secure-payment',
        title: 'دفع آمن وموثوق',
        subtitle: 'خيارات دفع آمنة مع حماية كاملة لبياناتك',
        icon: 'card-outline',
    },
    {
        id: 'support',
        title: 'دعم سريع',
        subtitle: 'فريق خدمة جاهز لمساعدتك قبل وبعد الطلب',
        icon: 'headset-outline',
    },
    {
        id: 'exchange',
        title: 'حجز سريع',
        subtitle: 'اختاري المنسّقة والخدمة وأكملي الطلب بخطوات بسيطة',
        icon: 'flash-outline',
    },
];

export default function HomeWhyUsSection() {
    return (
        <FlatList
            data={WHY_US_ITEMS}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <View style={styles.iconWrap}>
                        <Ionicons name={item.icon} size={20} color="#064E3B" />
                    </View>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subtitle}>
                        {item.subtitle}
                    </Text>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: 20,
        gap: 12,
        paddingBottom: 4,
    },
    card: {
        width: 170,
        backgroundColor: '#FFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EEF0F4',
        paddingHorizontal: 12,
        paddingVertical: 14,
    },
    iconWrap: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#ECFDF5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 15,
        fontFamily: 'Cairo_700Bold',
        color: '#111827',
        marginBottom: 6,
        ...rtlText.alignStart,
    },
    subtitle: {
        fontSize: 12,
        lineHeight: 18,
        fontFamily: 'Cairo_400Regular',
        color: '#6B7280',
        ...rtlText.alignStart,
    },
});
