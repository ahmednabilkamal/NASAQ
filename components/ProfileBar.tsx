import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, I18nManager } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, IconSizes } from '@/utils/spacing';
import { FontSizes } from '@/utils/typography';


const ProfileBar = () => {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.stylistsList || (pageData as any)['en'].stylistsList;
    const isRTL = I18nManager.isRTL;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                                        <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#000" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.favoriteButton}>
                                        <Ionicons name="heart-outline" size={24} color="#000" />
                                    </TouchableOpacity>
                <Text style={styles.headerTitle}>{content.filterTitle}</Text>
            </View>
        </View>
    );
}

export default ProfileBar;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: BorderRadius.xxxl,
        borderTopRightRadius: BorderRadius.xxxl,
    },
     backButton: {
        position: 'absolute',
        top: Spacing.xl,
        left: Spacing.xl,
        width: IconSizes.xxl,
        height: IconSizes.xxl,
        borderRadius: BorderRadius.xxxl,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scale(1) },
        shadowOpacity: 0.1,
        shadowRadius: scale(5),
        elevation: 5,
    },
     favoriteButton: {
        position: 'absolute',
        top: Spacing.xl,
        right: Spacing.xl,
        width: IconSizes.xxl,
        height: IconSizes.xxl,
        borderRadius: BorderRadius.xxxl,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: scale(5),
        elevation: 5,
    },
    handle: {
        width: scale(40),
        height: scale(5),
        backgroundColor: '#EEE',
        borderRadius: scale(2.5),
        alignSelf: 'center',
        marginTop: scaleVertical(10),
    },
    header: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSizes.h4,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
});