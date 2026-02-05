import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function BottomNav() {
    const router = useRouter();
    const pathname = usePathname();

    const tabs = [
        { id: 'home', icon: 'home-outline', activeIcon: 'home', label: 'Home', route: '/pages/tabs/homescreen' },
        { id: 'saved', icon: 'heart-outline', activeIcon: 'heart', label: 'Saved', route: '/pages/tabs/stylists' }, 
        { id: 'scan', icon: 'scan-outline', activeIcon: 'scan', label: 'Scan', route: '', isCenter: true },
        { id: 'chat', icon: 'chatbubble-outline', activeIcon: 'chatbubble', label: 'Chat', route: '/pages/tabs/chat' },
        { id: 'profile', icon: 'person-outline', activeIcon: 'person', label: 'Profile', route: '/pages/tabs/profile' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.navBar}>
                {tabs.map((tab, index) => {
                    const isActive = pathname === tab.route;

                    if (tab.isCenter) {
                        return (
                            <TouchableOpacity key={tab.id} style={styles.centerButtonContainer}>
                                <View style={styles.centerButton}>
                                    <Ionicons name="scan" size={30} color="#FFF" />
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
                                size={24}
                                color={isActive ? '#064E3B' : '#999'}
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
        height: 100,
        backgroundColor: '#FFF',
        
        
        
        alignItems: 'center',
        justifyContent: 'space-around',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        
        elevation: 10,
        
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    centerButtonContainer: {
        marginTop: -80,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 10,
        borderRadius: 100,
        borderColor: "white",
        backgroundColor: "white",
        

    },
    centerButton: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        backgroundColor: '#064E3B',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 5,
        borderColor: '#F8F9FB',
    },
});
