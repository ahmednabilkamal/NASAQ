import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Switch,
    I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import BottomNav from '@/components/BottomNav';

export default function ProfileScreen() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.profile || (pageData as any)['en'].profile;
    const isRTL = I18nManager.isRTL;

    const [darkMode, setDarkMode] = useState(false);

    const MenuItem = ({ icon, label, onPress, rightElement }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <Ionicons name={icon} size={22} color="#666" />
                <Text style={styles.menuItemLabel}>{label}</Text>
            </View>
            {rightElement ? rightElement : (
                <Ionicons
                    name={isRTL ? "chevron-back" : "chevron-forward"}
                    size={20}
                    color="#CCC"
                />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{content.title}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Info */}
                <View style={styles.profileCard}>
                    <Image
                        source={require('@/assets/page1bg.png')}
                        style={styles.avatar}
                    />
                    <View style={styles.profileText}>
                        <Text style={styles.name}>نور حسن</Text>
                        <Text style={styles.email}>nourhasan12@gmail.com</Text>
                    </View>
                </View>

                {/* Section: Personal Info */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="person-outline" size={18} color="#666" />
                        <Text style={styles.sectionTitle}>{content.personalInfo}</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <MenuItem
                            label={content.editProfile}
                            icon="create-outline"
                            onPress={() => { }}
                        />
                        <MenuItem
                            label={content.changePassword}
                            icon="lock-closed-outline"
                            onPress={() => { }}
                        />
                        <MenuItem
                            label={content.payments}
                            icon="card-outline"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* Section: Settings */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="settings-outline" size={18} color="#666" />
                        <Text style={styles.sectionTitle}>{content.settings}</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <MenuItem
                            label={content.darkMode}
                            icon="moon-outline"
                            rightElement={
                                <Switch
                                    value={darkMode}
                                    onValueChange={setDarkMode}
                                    trackColor={{ false: "#EEE", true: "#064E3B" }}
                                />
                            }
                        />
                        <MenuItem
                            label={content.notifications}
                            icon="notifications-outline"
                            onPress={() => { }}
                        />
                        <MenuItem
                            label={content.language}
                            icon="globe-outline"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* Section: Support */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="headset-outline" size={18} color="#666" />
                        <Text style={styles.sectionTitle}>{content.support}</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <MenuItem label={content.help} icon="help-circle-outline" onPress={() => { }} />
                        <MenuItem label={content.contactUs} icon="chatbubbles-outline" onPress={() => { }} />
                        <MenuItem label={content.privacy} icon="shield-checkmark-outline" onPress={() => { }} />
                    </View>
                </View>
            </ScrollView>
            <BottomNav />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 20,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#E1E1E1',
    },
    profileText: {
        marginLeft: 15,
        flex: 1,
        alignItems: 'flex-start',
    },
    name: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    email: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
    },
    section: {
        marginBottom: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#666',
    },
    sectionContent: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F8F9FA',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuItemLabel: {
        fontSize: 15,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
    },
});
