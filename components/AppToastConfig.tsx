import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { rtlText } from '@/config/rtlText';
import { colors } from '@/theme/colors';

export const appToastConfig = {
    success: (props: any) => (
        <BaseToast
            {...props}
            style={{
                borderLeftColor: colors.brand.primary,
                backgroundColor: colors.brand.primaryMuted,
                height: 70,
                borderRadius: 15,
                borderLeftWidth: 10,
            }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{
                fontSize: 16,
                fontFamily: 'Cairo_700Bold',
                color: colors.brand.primary,
                ...rtlText.alignStart,
            }}
            text2Style={{
                fontSize: 14,
                fontFamily: 'Cairo_400Regular',
                color: '#374151',
                ...rtlText.alignStart,
            }}
            renderLeadingIcon={() => (
                <View style={{ justifyContent: 'center', paddingHorizontal: 15 }}>
                    <Ionicons name="checkmark-circle" size={28} color={colors.brand.primary} />
                </View>
            )}
        />
    ),
    error: (props: any) => (
        <ErrorToast
            {...props}
            style={{
                borderLeftColor: colors.semantic.error,
                backgroundColor: colors.semantic.errorMuted,
                height: 70,
                borderRadius: 15,
                borderLeftWidth: 10,
            }}
            text1Style={{
                fontSize: 16,
                fontFamily: 'Cairo_700Bold',
                color: colors.semantic.error,
                ...rtlText.alignStart,
            }}
            text2Style={{
                fontSize: 14,
                fontFamily: 'Cairo_400Regular',
                color: '#374151',
                ...rtlText.alignStart,
            }}
            renderLeadingIcon={() => (
                <View style={{ justifyContent: 'center', paddingHorizontal: 15 }}>
                    <Ionicons name="alert-circle" size={28} color={colors.semantic.error} />
                </View>
            )}
        />
    ),
};

export function AppToast() {
    return <Toast config={appToastConfig} />;
}
