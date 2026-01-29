import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';

export default function ContactUsScreen() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.profile || (pageData as any)['en'].profile;
    const isRTL = I18nManager.isRTL;

    const ContactItem = ({ icon, label, value }: any) => (
        <View style={styles.contactItem}>
            <View style={styles.contactIcon}>
                <Ionicons name={icon} size={20} color="#666" />
            </View>
            <View style={styles.contactText}>
                <Text style={styles.contactLabel}>{label}</Text>
                <Text style={styles.contactValue}>{value}</Text>
            </View>
        </View>
    );

    const SocialItem = ({ icon, label, handle, color }: any) => (
        <TouchableOpacity style={styles.socialItem}>
            <View style={[styles.socialIcon, { backgroundColor: color }]}>
                <Ionicons name={icon} size={20} color="#FFF" />
            </View>
            <View style={styles.socialText}>
                <Text style={styles.socialLabel}>{label}</Text>
                <Text style={styles.socialHandle}>{handle}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{content.contactUs}</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>دعم العملاء</Text>
                    <View style={styles.card}>
                        <ContactItem icon="call-outline" label="رقم التواصل" value="+20 25268652" />
                        <View style={styles.divider} />
                        <ContactItem icon="mail-outline" label="عنوان البريد الإلكتروني" value="help@gmail.com" />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>وسائل التواصل الإجتماعي</Text>
                    <View style={styles.card}>
                        <SocialItem icon="logo-instagram" label="إنستجرام" handle="@baraband" color="#E1306C" />
                        <View style={styles.divider} />
                        <SocialItem icon="logo-twitter" label="تويتر" handle="@baraband" color="#1DA1F2" />
                        <View style={styles.divider} />
                        <SocialItem icon="logo-facebook" label="فيس بوك" handle="@baraband" color="#4267B2" />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#999',
        marginBottom: 10,
        textAlign: 'right',
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    contactItem: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingVertical: 10,
    },
    contactIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15,
    },
    contactText: {
        alignItems: 'flex-end',
    },
    contactLabel: {
        fontSize: 12,
        color: '#999',
        fontFamily: 'Cairo_400Regular',
    },
    contactValue: {
        fontSize: 14,
        color: '#000',
        fontFamily: 'Cairo_700Bold',
    },
    socialItem: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingVertical: 10,
    },
    socialIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15,
    },
    socialText: {
        alignItems: 'flex-end',
    },
    socialLabel: {
        fontSize: 12,
        color: '#999',
        fontFamily: 'Cairo_400Regular',
    },
    socialHandle: {
        fontSize: 14,
        color: '#000',
        fontFamily: 'Cairo_700Bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 5,
    },
});
