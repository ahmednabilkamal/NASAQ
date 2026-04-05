import { useChatUnread } from '@/providers/ChatUnreadProvider';
import { usePathname, useRouter } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { userScreenDirection } from '@/config/rtlLayout';
import { scale, scaleVertical } from '@/utils/responsive';
import { ComponentSizes } from '@/utils/spacing';

const ACTIVE_COLOR = '#064E3B';
const INACTIVE_COLOR = '#999';

const TAB_NAV_DEBOUNCE_MS = 450;

function formatChatTabBadge(total: number): string | null {
    if (total <= 0) return null;
    return total > 99 ? '99+' : String(total);
}

export default function BottomNav() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const lastTabNavAt = useRef(0);
    const { totalUnread } = useChatUnread();
    const chatBadge = formatChatTabBadge(totalUnread);

    const tabs = [
        { id: 'profile', icon: 'person-outline' as const, label: 'الملف', route: '/pages/tabs/profile' },
        { id: 'orders', icon: 'receipt-outline' as const, label: 'الطلبات', route: '/pages/orders' },
        { id: 'home', icon: 'home' as const, label: 'الرئيسية', route: '/pages/tabs/homescreen', isCenter: true },
        { id: 'favorites', icon: 'heart-outline' as const, label: 'المفضلة', route: '/pages/tabs/favorites' },
        { id: 'chat', icon: 'chatbubble-ellipses-outline' as const, label: 'المحادثات', route: '/pages/tabs/chat' },
    ];

    const tabIsActive = (tab: (typeof tabs)[number]): boolean => {
        if (pathname === tab.route) return true;
        if (tab.id === 'home') return pathname.includes('/tabs/homescreen');
        if (tab.id === 'profile') {
            return (
                pathname.includes('/tabs/profile') ||
                pathname.includes('/pages/profile/') ||
                pathname.includes('/pages/payment/') ||
                pathname.includes('/pages/settings/') ||
                pathname.includes('/pages/notifications') ||
                pathname.includes('/pages/tickets') ||
                pathname.includes('/pages/contact_us')
            );
        }
        if (tab.id === 'orders') {
            return (
                pathname.includes('/pages/orders') ||
                pathname.includes('/pages/order_details') ||
                pathname.includes('/pages/checkout')
            );
        }
        if (tab.id === 'favorites') return pathname.includes('/tabs/favorites');
        if (tab.id === 'chat') return pathname.includes('/tabs/chat') || pathname.includes('/pages/chat');
        return false;
    };

    /** Avoid stacking duplicate routes when already on this tab’s root; debounce rapid taps. */
    const isTabRootActive = (tab: (typeof tabs)[number]): boolean => {
        if (tab.id === 'home') return pathname.includes('/tabs/homescreen');
        if (tab.id === 'profile') return pathname === '/pages/tabs/profile';
        if (tab.id === 'orders') return pathname === '/pages/orders';
        if (tab.id === 'favorites') return pathname === '/pages/tabs/favorites';
        if (tab.id === 'chat') return pathname === '/pages/tabs/chat';
        return false;
    };

    const navigateToTab = useCallback(
        (tab: (typeof tabs)[number]) => {
            if (isTabRootActive(tab)) return;
            const now = Date.now();
            if (now - lastTabNavAt.current < TAB_NAV_DEBOUNCE_MS) return;
            lastTabNavAt.current = now;
            router.push(tab.route as any);
        },
        [pathname, router]
    );

    return (
        <View style={[styles.container, userScreenDirection]}>
            <View
                style={[
                    styles.navBar,
                    { paddingBottom: Math.max(insets.bottom, scaleVertical(8)) },
                ]}
            >
                {tabs.map((tab) => {
                    const isActive = tabIsActive(tab);

                    if (tab.isCenter) {
                        return (
                            <TouchableOpacity
                                key={tab.id}
                                style={styles.centerButtonContainer}
                                activeOpacity={0.8}
                                onPress={() => navigateToTab(tab)}
                            >
                                <View style={[styles.centerButton, isActive && styles.centerButtonActive]}>
                                    <Ionicons name={tab.icon} size={26} color="#FFF" />
                                </View>
                                <Text style={[styles.tabLabel, styles.tabLabelActive]}>{tab.label}</Text>
                            </TouchableOpacity>
                        );
                    }

                    return (
                        <TouchableOpacity
                            key={tab.id}
                            style={styles.tabItem}
                            activeOpacity={0.7}
                            onPress={() => navigateToTab(tab)}
                        >
                            <View style={styles.tabIconWrap}>
                                <Ionicons
                                    name={isActive ? (tab.icon.replace('-outline', '') as any) : tab.icon}
                                    size={22}
                                    color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
                                />
                                {tab.id === 'chat' && chatBadge ? (
                                    <View style={styles.chatUnreadBadge}>
                                        <Text style={styles.chatUnreadBadgeText}>{chatBadge}</Text>
                                    </View>
                                ) : null}
                            </View>
                            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    navBar: {
        flexDirection: 'row',
        minHeight: ComponentSizes.bottomNavHeight,
        backgroundColor: '#FFF',
        borderTopLeftRadius: scale(24),
        borderTopRightRadius: scale(24),
        alignItems: 'center',
        justifyContent: 'space-around',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 15,
        paddingHorizontal: scale(8),
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: 2,
    },
    tabIconWrap: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatUnreadBadge: {
        position: 'absolute',
        top: scale(-6),
        end: scale(-10),
        minWidth: scale(18),
        height: scale(18),
        paddingHorizontal: scale(4),
        borderRadius: scale(9),
        backgroundColor: '#DC2626',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatUnreadBadgeText: {
        color: '#FFF',
        fontSize: 9,
        fontFamily: 'Cairo_700Bold',
    },
    tabLabel: {
        fontSize: 10,
        fontFamily: 'Cairo_400Regular',
        color: INACTIVE_COLOR,
        textAlign: 'center',
        marginTop: 2,
    },
    tabLabelActive: {
        color: ACTIVE_COLOR,
        fontFamily: 'Cairo_700Bold',
    },
    centerButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -20,
    },
    centerButton: {
        width: ComponentSizes.bottomNavCenterButton,
        height: ComponentSizes.bottomNavCenterButton,
        borderRadius: ComponentSizes.bottomNavCenterButton / 2,
        backgroundColor: ACTIVE_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#064E3B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: scale(4),
        borderColor: '#FFF',
    },
    centerButtonActive: {
        backgroundColor: '#043927',
    },
});
