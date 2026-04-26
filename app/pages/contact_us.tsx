import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { userScreenDirection } from '@/config/rtlLayout';
import { rtlText } from '@/config/rtlText';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/config/languageRef';
import { useEffect, useState } from 'react';
import { apiService, type PlatformSettings } from '@/config/apiService';
import pageData from '@/data/content';
import { getBackChevron } from '@/config/directionalIcons';

export default function ContactUsScreen() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.profile || (pageData as any)['ar'].profile;
    const contactContent = (pageData as any)[languageCode]?.contactUs || (pageData as any)['ar'].contactUs;
    const [platformContact, setPlatformContact] = useState<Pick<PlatformSettings, 'phone' | 'email'> | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await apiService.getPlatformSettings();
                const phone = typeof res.data?.phone === 'string' ? res.data.phone.trim() : '';
                const email = typeof res.data?.email === 'string' ? res.data.email.trim() : '';
                if (!cancelled) {
                    setPlatformContact({ phone, email });
                }
            } catch {
                if (!cancelled) {
                    setPlatformContact(null);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const ContactItem = ({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) => (
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

    return (
        <SafeAreaView style={[styles.container, userScreenDirection]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
                    <Ionicons name={getBackChevron()} size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{content.contactUs}</Text>
                <View style={styles.headerSpacer} />
            </View>

            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{contactContent.customerSupport}</Text>
                    <View style={styles.card}>
                        <ContactItem
                            icon="call-outline"
                            label={contactContent.phoneLabel}
                            value={platformContact?.phone || '+20 25268652'}
                        />
                        <View style={styles.divider} />
                        <ContactItem
                            icon="mail-outline"
                            label={contactContent.emailLabel}
                            value={platformContact?.email || 'help@venus.com'}
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
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        ...rtlText.alignCenter,
    },
    headerSpacer: {
        width: 24,
        height: 24,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#999',
        marginBottom: 10,
        ...rtlText.alignStart,
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 12,
    },
    contactIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactText: {
        flex: 1,
        minWidth: 0,
        alignItems: 'stretch',
    },
    contactLabel: {
        fontSize: 12,
        color: '#999',
        fontFamily: 'Cairo_400Regular',
        ...rtlText.alignStart,
    },
    contactValue: {
        fontSize: 14,
        color: '#000',
        fontFamily: 'Cairo_700Bold',
        ...rtlText.alignStart,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 5,
    },
});
