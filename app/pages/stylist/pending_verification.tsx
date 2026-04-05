import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/config/authContext';
import { isStylistUser, isStylistVerified } from '@/config/navigationFlow';
import { ROUTES } from '@/constants/routes';
import { stylistScreenDirection } from '@/config/rtlLayout';
import { rtlText } from '@/config/rtlText';
import { STYLIST_GREEN } from '@/components/StylistScreenHeader';
import { colors } from '@/theme/colors';

export default function StylistPendingVerificationScreen() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading, refreshUser, logout } = useAuth();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace(ROUTES.login as any);
            return;
        }
        if (!authLoading && isAuthenticated && !isStylistUser(user)) {
            router.replace(ROUTES.tabs.homescreen as any);
            return;
        }
        if (!authLoading && isAuthenticated && isStylistUser(user) && isStylistVerified(user)) {
            router.replace(ROUTES.stylist.home as any);
        }
    }, [authLoading, isAuthenticated, user]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refreshUser();
        } finally {
            setRefreshing(false);
        }
    }, [refreshUser]);

    const handleLogout = async () => {
        await logout();
        router.replace(ROUTES.login as any);
    };

    if (authLoading) {
        return (
            <View style={[styles.centered, stylistScreenDirection]}>
                <ActivityIndicator size="large" color={STYLIST_GREEN} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, stylistScreenDirection]} edges={['top', 'left', 'right']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={STYLIST_GREEN} />
                }
            >
                <View style={styles.iconWrap}>
                    <Ionicons name="time-outline" size={64} color={STYLIST_GREEN} />
                </View>
                <Text style={styles.title}>طلبك قيد المراجعة</Text>
                <Text style={[styles.body, rtlText.alignStart]}>
                    شكراً لإكمال ملفك كمنسّق أزياء. فريق نسق يتحقق من بياناتك. ستصل إلى لوحة التحكم فور
                    الموافقة من الإدارة.
                </Text>
                <Text style={[styles.hint, rtlText.alignStart]}>
                    اسحب للأسفل للتحديث بعد استلام موافقة الإدارة.
                </Text>
                <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh} disabled={refreshing}>
                    <Ionicons name="refresh" size={20} color={colors.surface.white} style={styles.refreshIcon} />
                    <Text style={styles.refreshBtnText}>تحديث الحالة</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>تسجيل الخروج</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surface.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 32,
        alignItems: 'center',
    },
    iconWrap: {
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.brand.primaryDark,
        textAlign: 'center',
        marginBottom: 16,
    },
    body: {
        fontSize: 16,
        lineHeight: 26,
        color: '#374151',
        textAlign: 'center',
        marginBottom: 12,
    },
    hint: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 28,
    },
    refreshBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: STYLIST_GREEN,
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 12,
        marginBottom: 16,
    },
    refreshIcon: {
        marginLeft: 8,
    },
    refreshBtnText: {
        color: colors.surface.white,
        fontSize: 16,
        fontWeight: '600',
    },
    logoutBtn: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    logoutText: {
        fontSize: 15,
        color: colors.semantic.error,
        fontWeight: '500',
    },
});
