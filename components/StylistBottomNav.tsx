import { useChatUnread } from '@/providers/ChatUnreadProvider';
import { usePathname, useRouter } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { stylistScreenDirection } from '@/config/rtlLayout';
import { scale, scaleVertical } from '@/utils/responsive';
import { ComponentSizes } from '@/utils/spacing';

const ACTIVE_COLOR = '#064E3B';
const INACTIVE_COLOR = '#999';
const TAB_NAV_DEBOUNCE_MS = 450;

function formatChatTabBadge(total: number): string | null {
    if (total <= 0) return null;
    return total > 99 ? '99+' : String(total);
}

function AnimatedStylistTabItem({
    tab,
    isActive,
    onPress,
    chatBadge,
}: {
    tab: {
        id: string;
        icon: 'settings-outline' | 'receipt-outline' | 'home' | 'grid-outline' | 'chatbubble-ellipses-outline';
        label: string;
        route: string;
        isCenter?: boolean;
    };
    isActive: boolean;
    onPress: () => void;
    chatBadge: string | null;
}) {
    const scale = useRef(new Animated.Value(0.9)).current;
    const iconRise = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.spring(scale, {
                toValue: isActive ? 1 : 0.95,
                useNativeDriver: true,
                friction: 7,
                tension: 120,
            }),
            Animated.timing(iconRise, {
                toValue: isActive ? -2 : 0,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start();
    }, [iconRise, isActive, scale]);

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.9,
            useNativeDriver: true,
            friction: 8,
            tension: 160,
        }).start();
    };

    const handleSelectAndNavigate = () => {
        Animated.sequence([
            Animated.spring(scale, {
                toValue: 0.88,
                useNativeDriver: true,
                friction: 8,
                tension: 170,
            }),
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                friction: 7,
                tension: 120,
            }),
        ]).start();

        // Let the press animation show before route transition/remount.
        setTimeout(onPress, 90);
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: isActive ? 1 : 0.95,
            useNativeDriver: true,
            friction: 7,
            tension: 120,
        }).start();
    };

    if (tab.isCenter) {
        return (
            <TouchableOpacity
                key={tab.id}
                style={styles.centerButtonContainer}
                activeOpacity={0.85}
                onPress={handleSelectAndNavigate}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <Animated.View
                    style={[
                        styles.centerButton,
                        isActive && styles.centerButtonActive,
                        { transform: [{ scale }] },
                    ]}
                >
                    <Ionicons name={tab.icon} size={26} color="#FFF" />
                </Animated.View>
                <Text style={[styles.tabLabel, styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            activeOpacity={0.8}
            onPress={handleSelectAndNavigate}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View style={[styles.tabIconWrap, { transform: [{ translateY: iconRise }, { scale }] }]}>
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
            </Animated.View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
            </Text>
        </TouchableOpacity>
    );
}

export default function StylistBottomNav() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const lastTabNavAt = useRef(0);
    const { totalUnread } = useChatUnread();
    const chatBadge = formatChatTabBadge(totalUnread);

    const tabs = [
        { id: 'settings', icon: 'settings-outline' as const, label: 'الإعدادات', route: '/pages/tabs/profile' },
        { id: 'orders', icon: 'receipt-outline' as const, label: 'الطلبات', route: '/pages/stylist/orders' },
        { id: 'home', icon: 'home' as const, label: 'الرئيسية', route: '/pages/stylist/home', isCenter: true },
        { id: 'services', icon: 'grid-outline' as const, label: 'الخدمات', route: '/pages/stylist/services' },
        { id: 'chat', icon: 'chatbubble-ellipses-outline' as const, label: 'المحادثات', route: '/pages/tabs/chat' },
    ];

    const isTabRootActive = (tab: (typeof tabs)[number]): boolean => {
        if (tab.id === 'home') return pathname.includes('/pages/stylist/home');
        if (tab.id === 'settings') return pathname === '/pages/tabs/profile';
        if (tab.id === 'orders') return pathname === '/pages/stylist/orders';
        if (tab.id === 'services') return pathname === '/pages/stylist/services';
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
        <View style={[styles.container, stylistScreenDirection]}>
            <View
                style={[
                    styles.navBar,
                    { paddingBottom: Math.max(insets.bottom, scaleVertical(8)) },
                ]}
            >
                {tabs.map((tab) => {
                    const isActive = pathname === tab.route ||
                        (tab.id === 'home' && pathname.includes('/stylist/home')) ||
                        (tab.id === 'settings' && (pathname.includes('/tabs/profile') || pathname.includes('/stylist/edit_profile') || pathname.includes('/stylist/earnings') || pathname.includes('/pages/settings')));
                    return (
                        <AnimatedStylistTabItem
                            key={tab.id}
                            tab={tab}
                            isActive={isActive}
                            onPress={() => navigateToTab(tab)}
                            chatBadge={chatBadge}
                        />
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
