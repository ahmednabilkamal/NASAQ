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
import { useAuth } from '@/config/authContext';
import pageData from '@/data/content';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, IconSizes } from '@/utils/spacing';
import { FontSizes } from '@/utils/typography';

export default function ContactUsScreen() {
    const router = useRouter();
    const { user } = useAuth();
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
        <TouchableOpacity 
            style={styles.socialItem}
            onPress={() => router.push('/pages/profile/edit?mode=social' as any)}
        >
            <View style={[styles.socialIcon, { backgroundColor: color }]}>
                <Ionicons name={icon} size={20} color="#FFF" />
            </View>
            <View style={styles.socialText}>
                <Text style={styles.socialLabel}>{label}</Text>
                <Text style={styles.socialHandle}>{handle || 'Not set'}</Text>
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
                <TouchableOpacity onPress={() => router.push('/pages/profile/edit?mode=social' as any)}>
                    <Text style={styles.editBtnText}>تعديل</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>دعم العملاء</Text>
                    <View style={styles.card}>
                        <ContactItem
                            icon="call-outline"
                            label="رقم التواصل"
                            value={user?.phone || '+20 25268652'}
                        />
                        <View style={styles.divider} />
                        <ContactItem
                            icon="mail-outline"
                            label="عنوان البريد الإلكتروني"
                            value={user?.email || 'help@venus.com'}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>وسائل التواصل الإجتماعي</Text>
                    <View style={styles.card}>
                        <SocialItem
                            icon="logo-instagram"
                            label="إنستجرام"
                            handle={user?.instagram}
                            color="#E1306C"
                        />
                        <View style={styles.divider} />
                        <SocialItem
                            icon="logo-twitter"
                            label="تويتر"
                            handle={user?.twitter}
                            color="#1DA1F2"
                        />
                        <View style={styles.divider} />
                        <SocialItem
                            icon="logo-facebook"
                            label="فيس بوك"
                            handle={user?.facebook}
                            color="#4267B2"
                        />
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
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingVertical: Spacing.verticalMd,
        backgroundColor: '#FFF',
    },
    headerTitle: {
        fontSize: FontSizes.h4,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    editBtnText: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
    content: {
        padding: Spacing.screenPadding,
    },
    section: {
        marginBottom: scaleVertical(30),
    },
    sectionTitle: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_700Bold',
        color: '#999',
        marginBottom: Spacing.verticalMd,
        textAlign: 'right',
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: BorderRadius.lg,
        padding: Spacing.cardPadding,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    contactItem: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingVertical: Spacing.verticalMd,
    },
    contactIcon: {
        width: IconSizes.md,
        height: IconSizes.md,
        borderRadius: BorderRadius.round,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Spacing.lg,
    },
    contactText: {
        alignItems: 'flex-end',
    },
    contactLabel: {
        fontSize: FontSizes.bodySmall,
        color: '#999',
        fontFamily: 'Cairo_400Regular',
    },
    contactValue: {
        fontSize: FontSizes.body,
        color: '#000',
        fontFamily: 'Cairo_700Bold',
    },
    socialItem: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingVertical: Spacing.verticalMd,
    },
    socialIcon: {
        width: IconSizes.md,
        height: IconSizes.md,
        borderRadius: BorderRadius.round,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Spacing.lg,
    },
    socialText: {
        alignItems: 'flex-end',
    },
    socialLabel: {
        fontSize: FontSizes.bodySmall,
        color: '#999',
        fontFamily: 'Cairo_400Regular',
    },
    socialHandle: {
        fontSize: FontSizes.body,
        color: '#000',
        fontFamily: 'Cairo_700Bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: Spacing.verticalXs,
    },
});
