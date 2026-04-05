import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { userScreenDirection } from '@/config/rtlLayout';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBackChevron } from '@/config/directionalIcons';
import { apiService, type PlatformSettings } from '@/config/apiService';
import { buildLegalWebDocument } from '@/utils/legalWebHtml';
import { colors } from '@/theme/colors';

type LegalField = keyof PlatformSettings;

type Props = {
    title: string;
    field: LegalField;
    emptyMessage: string;
    footer?: React.ReactNode;
};

export function LegalContentScreen({ title, field, emptyMessage, footer }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [html, setHtml] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await apiService.getPlatformSettings();
                const raw = res.data?.[field] ?? '';
                if (!cancelled) {
                    setHtml(buildLegalWebDocument(typeof raw === 'string' ? raw : '', emptyMessage));
                }
            } catch {
                if (!cancelled) {
                    setHtml(buildLegalWebDocument('', emptyMessage));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [field, emptyMessage]);

    return (
        <SafeAreaView style={[styles.container, userScreenDirection]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
                    <Ionicons name={getBackChevron()} size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={styles.headerSpacer} />
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.brand.primary} />
                </View>
            ) : (
                <View style={styles.body}>
                    <WebView
                        originWhitelist={['*']}
                        source={{ html }}
                        style={styles.webview}
                        nestedScrollEnabled
                    />
                    {footer}
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: colors.surface.white,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        textAlign: 'center',
    },
    headerSpacer: {
        width: 24,
        height: 24,
    },
    body: {
        flex: 1,
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
