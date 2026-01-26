import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
    backgroundImage: any;
    title: string;
    nextRoute: string;
    currentIndex: number;
    totalIndex: number;
}

export default function OnboardingScreen({
    backgroundImage,
    title,
    nextRoute,
    currentIndex,
    totalIndex,
}: OnboardingScreenProps) {
    const router = useRouter();

    const handleNext = () => {
        if (nextRoute) {
            router.push(nextRoute as any);
        }
    };

    const handleSkip = () => {
        router.push('/page4' as any);
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
                <SafeAreaView style={styles.overlay}>
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                            <Text style={styles.skipText}>تخطي</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bottomContainer}>
                        <View style={styles.pagination}>
                            {Array.from({ length: totalIndex }).map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.dot,
                                        currentIndex === index ? styles.activeDot : styles.inactiveDot,
                                    ]}
                                />
                            ))}
                        </View>

                        <Text style={styles.title}>{title}</Text>

                        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                            <Text style={styles.nextButtonText}>التالي</Text>
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
        alignItems: 'flex-end',
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
        alignItems: 'flex-end',
    },
    pagination: {
        flexDirection: 'row-reverse',
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
        textAlign: 'right',
        marginBottom: 35,
        lineHeight: 23,
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
