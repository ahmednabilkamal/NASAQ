import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, scaleVertical } from '@/utils/responsive';
import { IconSizes, ComponentSizes } from '@/utils/spacing';

export default function BottomNav() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const tabs = [
        { id: 'profile', icon: require('../assets/icons/user.png'), label: 'الملف', route: '/pages/tabs/profile' },
        { id: 'orders', icon: require('../assets/icons/bag.png'), label: 'الطلبات', route: '/pages/orders' },
        { id: 'home', icon: require('../assets/icons/home-2.png'), label: 'الرئيسية', route: '/pages/tabs/homescreen', isCenter: true },
        { id: 'favorites', icon: require('../assets/icons/house 2.png'), label: 'المفضلة', route: '/pages/tabs/favorites' },
        { id: 'chat', icon: require('../assets/icons/Group.png'), label: 'المحادثات', route: '/pages/tabs/chat' },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <View style={[styles.navBar, { paddingBottom: insets.bottom }]}>
                {tabs.map((tab, index) => {
                    const isActive = pathname === tab.route;

                    if (tab.isCenter) {
                        return (
                            <TouchableOpacity
                                key={tab.id}
                                style={styles.centerButtonContainer}
                                activeOpacity={1}
                                onPress={() => tab.route && router.push(tab.route as any)}
                            >
                                <View style={styles.centerButton}>
                                    <Image source={tab.icon} style={{ width: IconSizes.lg, height: IconSizes.lg, tintColor: '#FFF' }} resizeMode="contain" />
                                </View>
                            </TouchableOpacity>
                        );
                    }

                    return (
                        <TouchableOpacity
                            key={tab.id}
                            style={styles.tabItem}
                            activeOpacity={1}
                            onPress={() => tab.route && router.push(tab.route as any)}
                        >
                            <Image
                                source={tab.icon}
                                style={{
                                    width: IconSizes.md,
                                    height: IconSizes.md,
                                    tintColor: isActive ? '#064E3B' : '#666'
                                }}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </SafeAreaView>
    );

}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'transparent',
        left: 0,
        right: 0,
    },
    navBar: {
        flexDirection: 'row',
        height: ComponentSizes.bottomNavHeight,
        backgroundColor: '#FFF',
        borderTopLeftRadius: scale(30),
        borderTopRightRadius: scale(30),
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 -10px 10px rgba(0,0,0,0.05)',
        elevation: 15,
        paddingHorizontal: scale(10),
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    centerButtonContainer: {
        marginTop: ComponentSizes.bottomNavCenterMarginTop,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: scale(100),
        backgroundColor: "transparent",
    },
    centerButton: {
        width: ComponentSizes.bottomNavCenterButton,
        height: ComponentSizes.bottomNavCenterButton,
        borderRadius: ComponentSizes.bottomNavCenterButton / 2,
        backgroundColor: '#064E3B',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 8px 10px rgba(6,78,59,0.3)',
        elevation: 8,
        borderWidth: scale(6),
        borderColor: '#FFF',
    },
});
