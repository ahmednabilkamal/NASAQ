import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    I18nManager,
    Image,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '@/components/BottomNav';


const HomeScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Home Screen</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.welcomeText}>Welcome to Venus Style</Text>
            </ScrollView>
            <BottomNav />
        </SafeAreaView>
    );
};

export default HomeScreen;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#064E3B',
    },
    scrollContent: {
        padding: 20,
    },
    welcomeText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
});