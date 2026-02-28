import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen() {
    const router = useRouter();
    const [name, setName] = useState('أحمد محمد');
    const [email, setEmail] = useState('ahmed@gmail.com');
    const [phone, setPhone] = useState('512345678');
    const [countryCode, setCountryCode] = useState('+966');

    const handleUpdate = () => {
        // Update profile logic
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-forward" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>تعديل الملف الشخصي</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        <Image
                            source={require('@/assets/stylewomen1.png')}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.editAvatarButton}>
                            <Ionicons name="camera" size={16} color="#064E3B" />
                        </TouchableOpacity>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        {/* Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>الاسم</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                textAlign="right"
                                placeholder="أدخل اسمك"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>البريد الإلكتروني</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                textAlign="right"
                                placeholder="أدخل بريدك الإلكتروني"
                                placeholderTextColor="#999"
                                keyboardType="email-address"
                            />
                        </View>

                        {/* Phone */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>رقم الجوال</Text>
                            <View style={styles.phoneInputContainer}>
                                <TextInput
                                    style={styles.phoneInput}
                                    value={phone}
                                    onChangeText={setPhone}
                                    textAlign="right"
                                    placeholder="أدخل رقم الجوال"
                                    placeholderTextColor="#999"
                                    keyboardType="phone-pad"
                                />
                                <View style={styles.countryCodeContainer}>
                                    <Text style={styles.countryCode}>{countryCode}</Text>
                                    <Ionicons name="chevron-down" size={16} color="#666" />
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Update Button */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                        <Text style={styles.updateButtonText}>تعديل</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: '35%',
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    formContainer: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Cairo_600SemiBold',
        color: '#333',
        textAlign: 'right',
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 14,
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    phoneInputContainer: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        overflow: 'hidden',
    },
    phoneInput: {
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: 14,
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
    },
    countryCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderLeftWidth: 1,
        borderLeftColor: '#E5E5E5',
        gap: 5,
    },
    countryCode: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    updateButton: {
        backgroundColor: '#064E3B',
        height: 55,
        borderRadius: 27.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    updateButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
    },
});
