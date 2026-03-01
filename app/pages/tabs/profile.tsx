import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/config/authContext';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    I18nManager,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const router = useRouter();
    const { languageCode, setLanguageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.profile || (pageData as any)['en'].profile;
    const isRTL = I18nManager.isRTL;
    const { user, logout } = useAuth();

    const [darkMode, setDarkMode] = useState(false);
    const [isArabic, setIsArabic] = useState(languageCode === 'ar');

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

    const LanguageOption = ({ label, selected, onPress }: any) => (
        <TouchableOpacity style={styles.languageOption} onPress={onPress}>
            <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                {selected && <Ionicons name="checkmark" size={14} color="#FFF" />}
            </View>
            <Text style={styles.languageLabel}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>الملف الشخصي</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileInfo}>
                        <Text style={styles.name}>{user?.name || "نور حسن"}</Text>
                        <Text style={styles.email}>{user?.email || "nourhasan12@gmail.com"}</Text>
                    </View>
                    <Image
                        source={require('@/assets/stylewomen1.png')}
                        style={styles.avatar}
                    />
                </View>

                {/* Personal Info Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
                        <Ionicons name="person-outline" size={18} color="#666" />
                    </View>
                    <View style={styles.sectionContent}>
                        <MenuItem
                            label="تعديل الملف الشخصي"
                            icon="create-outline"
                            onPress={() => router.push('/pages/profile/edit' as any)}
                        />
                        <MenuItem
                            label="تغيير كلمة المرور"
                            icon="lock-closed-outline"
                            onPress={() => router.push('/pages/profile/change_password' as any)}
                        />
                        <MenuItem
                            label="المدفوعات"
                            icon="card-outline"
                            onPress={() => router.push('/pages/payment/cards' as any)}
                        />
                    </View>
                </View>

                {/* Settings Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>الإعدادات</Text>
                        <Ionicons name="settings-outline" size={18} color="#666" />
                    </View>
                    <View style={styles.sectionContent}>
                        <MenuItem
                            label="الوضع الداكن"
                            icon="moon-outline"
                            rightElement={
                                <Switch
                                    value={darkMode}
                                    onValueChange={setDarkMode}
                                    trackColor={{ false: "#EEE", true: "#064E3B" }}
                                    thumbColor="#FFF"
                                />
                            }
                        />
                        <MenuItem
                            label="الإشعارات"
                            icon="notifications-outline"
                            onPress={() => router.push('/pages/notifications' as any)}
                        />
                    </View>
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>الدعم</Text>
                        <Ionicons name="headset-outline" size={18} color="#666" />
                    </View>
                    <View style={styles.sectionContent}>
                        <MenuItem
                            label="المساعدة / الأسئلة الشائعة"
                            icon="help-circle-outline"
                            onPress={() => { }}
                        />
                        <MenuItem
                            label="تواصل معنا"
                            icon="chatbubbles-outline"
                            onPress={() => router.push('/pages/contact_us' as any)}
                        />
                        <MenuItem
                            label="الخصوصية والأمان"
                            icon="shield-checkmark-outline"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* Language Settings */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>إعدادات اللغة</Text>
                        <Ionicons name="globe-outline" size={18} color="#666" />
                    </View>
                    <View style={styles.languageContainer}>
                        <LanguageOption
                            label="العربية"
                            selected={isArabic}
                            onPress={() => {
                                setIsArabic(true);
                                setLanguageCode('ar');
                            }}
                        />
                        <LanguageOption
                            label="الانجليزية"
                            selected={!isArabic}
                            onPress={() => {
                                setIsArabic(false);
                                setLanguageCode('en');
                            }}
                        />
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => {
                        logout();
                        router.replace('/pages/login');
                    }}
                >
                    <Ionicons name="log-out-outline" size={22} color="#E11D48" />
                    <Text style={styles.logoutText}>تسجيل الخروج</Text>
                </TouchableOpacity>
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
        justifyContent: 'flex-end',
        paddingVertical: 20,
        marginBottom: 20,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E1E1E1',
    },
    profileInfo: {
        marginRight: 15,
        alignItems: 'flex-end',
    },
    name: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    email: {
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Cairo_600SemiBold',
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
        paddingVertical: 14,
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
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
    },
    languageContainer: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingVertical: 10,
        gap: 12,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#064E3B',
        borderColor: '#064E3B',
    },
    languageLabel: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#FFF',
        borderRadius: 15,
        paddingVertical: 15,
        marginTop: 10,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#FFE4E6',
    },
    logoutText: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#E11D48',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#FFF',
        borderRadius: 15,
        paddingVertical: 15,
        marginTop: 10,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#FFE4E6',
    },
    logoutText: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#E11D48',
    },
});
