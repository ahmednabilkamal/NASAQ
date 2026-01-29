import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, I18nManager } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { SafeAreaView } from 'react-native-safe-area-context';


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
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
     backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
     favoriteButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#EEE',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginTop: 10,
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
});