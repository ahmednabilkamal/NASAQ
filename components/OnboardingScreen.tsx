import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, Dimensions, I18nManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { saveOnboardingStep, setOnboardingCompleted } from '@/config/navigationFlow';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
    backgroundImage: any;
    title: string;
    subtitle?: string;
    nextRoute: string;
    currentIndex: number;
    totalIndex: number;
}

export default function OnboardingScreen({
    backgroundImage,
    title,
    subtitle,
    nextRoute,
    currentIndex,
    totalIndex,
}: OnboardingScreenProps) {
    const router = useRouter();
    const { languageCode } = useLanguage();

    const pageKey = `page${currentIndex + 1}`;
    const content = (pageData as any)[languageCode]?.[pageKey] || (pageData as any)['en'][pageKey];

    const skipText = content.skipText || content.optionalChoice || "Skip";
    const nextText = content.buttonText || "Next";

    const slideX = useSharedValue(-50);
    const opacity = useSharedValue(0);

    useEffect(() => {
        slideX.value = withTiming(0, {
            duration: 800,
            easing: Easing.out(Easing.exp)
        });
        opacity.value = withTiming(1, { duration: 800 });

        // Save current onboarding step
        saveOnboardingStep(currentIndex + 1);
    }, [currentIndex]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: slideX.value }],
        opacity: opacity.value,
    }));

    const handleNext = async () => {
        if (nextRoute) {
            router.push(nextRoute as any);
        } else if (currentIndex === 2) {
            await setOnboardingCompleted();
            console.log('✅ Onboarding completed, navigating to login');
            router.push('/pages/login' as any);
        }
    };

    const handleSkip = async () => {
        // Skip to login after marking onboarding as complete
        await setOnboardingCompleted();
        console.log('⏭️ Onboarding skipped, navigating to login');
        router.push('/pages/login' as any);
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
                <SafeAreaView style={styles.overlay}>
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                            <Text style={styles.skipText}>{skipText}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bottomContainer}>
                        <Animated.View style={[styles.pagination, animatedStyle]}>
                            {Array.from({ length: totalIndex }).map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.dot,
                                        currentIndex === index ? styles.activeDot : styles.inactiveDot,
                                    ]}
                                />
                            ))}
                        </Animated.View>

                        <Animated.View style={[styles.textContainer, animatedStyle]}>
                            <Text style={styles.title}>{title}</Text>
                            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                        </Animated.View>

                        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                            <Text style={styles.nextButtonText}>{nextText}</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        width: width,
        height: height,
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
    },
    topBar: {
        paddingHorizontal: 20,
        paddingTop: 40,
        flexDirection: 'row',
        justifyContent: I18nManager.isRTL ? 'flex-start' : 'flex-end',
        marginVertical: 25,
    },
    skipButton: {
        backgroundColor: '#064E3B',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 8,
    },
    skipText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        lineHeight: 14,
        letterSpacing: 0,
    },
    bottomContainer: {
        paddingHorizontal: 25,
        paddingBottom: 40,
        alignItems: 'stretch',
    },
    textContainer: {
        marginBottom: 35,
        alignItems: 'flex-start',
    },
    pagination: {
        flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
        marginBottom: 25,
        gap: 8,
        alignSelf: 'center',
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        width: 25,
        backgroundColor: '#10B981',
    },
    inactiveDot: {
        width: 8,
        backgroundColor: '#FFFFFF',
        opacity: 0.5,
    },
    title: {
        width: '100%',
        color: '#FFFFFF',
        fontSize: 23,
        fontFamily: 'Cairo_700Bold',
        textAlign: I18nManager.isRTL ? 'left' : 'right',
        lineHeight: 32,
        letterSpacing: 0,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    subtitle: {
        width: '100%',
        color: '#FFFFFF',
        fontSize: 23,
        fontFamily: 'Cairo_700Bold',
        textAlign: I18nManager.isRTL ? 'left' : 'right',
        marginTop: 5,
        lineHeight: 32,
        letterSpacing: 0,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    nextButton: {
        backgroundColor: '#064E3B',
        width: '100%',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        lineHeight: 14,
        letterSpacing: 0,
    },
});
