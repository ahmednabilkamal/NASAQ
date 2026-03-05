import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function BottomNav() {
    const router = useRouter();
    const pathname = usePathname();

    const tabs = [
        { id: 'profile', icon: 'person-outline', activeIcon: 'person', label: 'Profile', route: '/pages/tabs/profile' },
        { id: 'orders', icon: 'bag-outline', activeIcon: 'bag', label: 'Orders', route: '/pages/orders' },
        { id: 'home', icon: 'home', activeIcon: 'home', label: 'Home', route: '/pages/tabs/homescreen', isCenter: true },
        { id: 'favorites', icon: 'heart-outline', activeIcon: 'heart', label: 'Favorites', route: '/pages/tabs/favorites' },
        { id: 'chat', icon: 'chatbox-ellipses-outline', activeIcon: 'chatbox-ellipses', label: 'Chat', route: '/pages/tabs/chat' },
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
                                    <Ionicons name="home" size={28} color="#FFF" />
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
                            <Ionicons
                                name={(isActive ? tab.activeIcon : tab.icon) as any}
                                size={26}
                                color={isActive ? '#064E3B' : '#666'}
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
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
        shadowColor: '#064E3B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
        borderWidth: 6,
        borderColor: '#FFF',
    },
});
