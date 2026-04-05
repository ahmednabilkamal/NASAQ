import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getBackChevron } from '@/config/directionalIcons';
import { Spacing, BorderRadius, Shadows } from '@/utils/spacing';
import { FontSizes } from '@/utils/typography';

export const STYLIST_GREEN = '#064E3B';
export const STYLIST_GREEN_MUTED = '#ECFDF5';

export type StylistScreenHeaderProps = {
    /**
     * Centered title (standard stylist sub-screens).
     * Omit when using `homeLeading` for the dashboard row.
     */
    title?: string;
    /**
     * Show back chevron. Ignored when `homeLeading` is set.
     * @default true when `title` is set
     */
    showBack?: boolean;
    onBackPress?: () => void;
    /** Right slot: notifications, add button, or spacer. */
    rightAccessory?: React.ReactNode;
    /**
     * Stylist home: avatar + greeting block (fills start side; no back).
     */
    homeLeading?: React.ReactNode;
    /** e.g. horizontal filter chips */
    children?: React.ReactNode;
    style?: ViewStyle;
};

export function StylistScreenHeader({
    title,
    showBack,
    onBackPress,
    rightAccessory,
    homeLeading,
    children,
    style,
}: StylistScreenHeaderProps) {
    const router = useRouter();
    const handleBack = onBackPress ?? (() => router.back());

    const isHome = Boolean(homeLeading);
    const actuallyShowBack = !isHome && showBack !== false;

    return (
        <LinearGradient
            colors={['#FFFFFF', STYLIST_GREEN_MUTED]}
            locations={[0.55, 1]}
            style={[styles.gradient, style]}
        >
            <View style={styles.headerRow}>
                {isHome ? (
                    <>
                        <View style={styles.homeLeadingWrap}>{homeLeading}</View>
                        {rightAccessory != null ? (
                            <View style={styles.rightSlot}>{rightAccessory}</View>
                        ) : (
                            <View style={styles.headerIconBtn} />
                        )}
                    </>
                ) : (
                    <>
                        <View style={styles.headerIconBtn}>
                            {actuallyShowBack ? (
                                <TouchableOpacity
                                    onPress={handleBack}
                                    style={styles.hitTarget}
                                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                >
                                    <Ionicons
                                        name={getBackChevron()}
                                        size={24}
                                        color={STYLIST_GREEN}
                                    />
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.iconPlaceholder} />
                            )}
                        </View>
                        <View style={styles.titleWrap}>
                            {title ? (
                                <Text style={styles.headerTitle} numberOfLines={1}>
                                    {title}
                                </Text>
                            ) : null}
                        </View>
                        <View style={styles.headerIconBtn}>
                            {rightAccessory ?? <View style={styles.iconPlaceholder} />}
                        </View>
                    </>
                )}
            </View>
            {children}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        paddingBottom: Spacing.verticalMd,
        borderBottomLeftRadius: BorderRadius.xl,
        borderBottomRightRadius: BorderRadius.xl,
        ...Shadows.small,
        shadowOpacity: 0.06,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingTop: Spacing.verticalSm,
        paddingBottom: Spacing.verticalMd,
    },
    homeLeadingWrap: {
        flex: 1,
        minWidth: 0,
    },
    rightSlot: {
        marginStart: Spacing.sm,
    },
    headerIconBtn: {
        minWidth: 40,
        minHeight: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hitTarget: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconPlaceholder: {
        minWidth: 40,
        minHeight: 40,
    },
    titleWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
    },
    headerTitle: {
        fontSize: FontSizes.h2,
        fontFamily: 'Cairo_700Bold',
        color: '#0F172A',
        textAlign: 'center',
    },
});
