import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LegalContentScreen } from '@/components/settings/LegalContentScreen';
import { ROUTES } from '@/constants/routes';
import { colors } from '@/theme/colors';

export default function SettingsNotificationsScreen() {
    const router = useRouter();

    return (
        <LegalContentScreen
            title="الإشعارات والتنبيهات"
            field="notifications_policy"
            emptyMessage="لم يتم نشر معلومات الإشعارات بعد. يمكن للمسؤول إضافتها من لوحة التحكم → إعدادات المنصة."
            footer={
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.cta}
                        activeOpacity={0.85}
                        onPress={() => router.push(ROUTES.client.notifications as any)}
                    >
                        <Text style={styles.ctaText}>عرض سجل الإشعارات</Text>
                    </TouchableOpacity>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: colors.surface.white,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E5E7EB',
    },
    cta: {
        backgroundColor: colors.brand.primary,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    ctaText: {
        fontFamily: 'Cairo_700Bold',
        fontSize: 16,
        color: '#FFF',
    },
});
