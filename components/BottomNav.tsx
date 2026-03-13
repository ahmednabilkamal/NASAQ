import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View, Image } from 'react-native';

const { width } = Dimensions.get('window');

export default function BottomNav() {
    const router = useRouter();
    const pathname = usePathname();

    const tabs = [
        { id: 'profile', icon: require('../assets/icons/user.png'), label: 'Profile', route: '/pages/tabs/profile' },
        { id: 'orders', icon: require('../assets/icons/bag.png'), label: 'Orders', route: '/pages/orders' },
        { id: 'home', icon: require('../assets/icons/home-2.png'), label: 'Home', route: '/pages/tabs/homescreen', isCenter: true },
        { id: 'favorites', icon: require('../assets/icons/house 2.png'), label: 'Favorites', route: '/pages/tabs/favorites' },
        { id: 'chat', icon: require('../assets/icons/Group.png'), label: 'Chat', route: '/pages/tabs/chat' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.navBar}>
                {tabs.map((tab, index) => {
                    const isActive = pathname === tab.route;

                    if (tab.isCenter) {
                        return (
                            <TouchableOpacity
                                key={tab.id}
                                style={styles.centerButtonContainer}
                                onPress={() => tab.route && router.push(tab.route as any)}
                            >
                                <View style={styles.centerButton}>
                                    <Image source={tab.icon} style={{ width: 28, height: 28, tintColor: '#FFF' }} resizeMode="contain" />
                                </View>
                            </TouchableOpacity>
                        );
                    }

                    return (
                        <TouchableOpacity
                            key={tab.id}
                            style={styles.tabItem}
                            onPress={() => tab.route && router.push(tab.route as any)}
                        >
                            <Image
                                source={tab.icon}
                                style={{
                                    width: 26,
                                    height: 26,
                                    tintColor: isActive ? '#064E3B' : '#666'
                                }}
                                resizeMode="contain"
                            />
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
        width: width,


        backgroundColor: 'transparent',
    },
    navBar: {
        flexDirection: 'row',
        height: 75,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 -10px 10px rgba(0,0,0,0.05)',
        elevation: 15,
        paddingHorizontal: 10,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    centerButtonContainer: {
        marginTop: -55,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 100,
        backgroundColor: "transparent",
    },
    centerButton: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        backgroundColor: '#064E3B',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 8px 10px rgba(6,78,59,0.3)',
        elevation: 8,
        borderWidth: 6,
        borderColor: '#FFF',
    },
});
