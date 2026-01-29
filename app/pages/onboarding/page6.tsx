import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, PanResponder, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import EvaluationLayout from '../../../components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HeightPage() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.heightSelection || (pageData as any)['en'].heightSelection;

    const [unit, setUnit] = useState<'cm' | 'ft'>('cm');
    const [height, setHeight] = useState(170);

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
            const scaleHeight = 240; // Height of the slider area
            const minHeight = 140;
            const maxHeight = 190;
            const relativeY = Math.max(0, Math.min(scaleHeight, evt.nativeEvent.locationY));
            const newHeight = Math.round(maxHeight - (relativeY / scaleHeight) * (maxHeight - minHeight));
            setHeight(newHeight);
        },
    });

    return (
        <SafeAreaView style={styles.container}>

            <EvaluationLayout
                title={content.title}
                subtitle={content.subtitle}
                currentStep={5}
                totalSteps={10}
                onNext={() => router.push('/pages/onboarding/page7' as any)}
                nextButtonText={content.nextButton}
            >
                <View style={styles.container}>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleButton, unit === 'cm' && styles.toggleButtonActive]}
                            onPress={() => setUnit('cm')}
                        >
                            <Text style={[styles.toggleText, unit === 'cm' && styles.toggleTextActive]}>{content.unitCm}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleButton, unit === 'ft' && styles.toggleButtonActive]}
                            onPress={() => setUnit('ft')}
                        >
                            <Text style={[styles.toggleText, unit === 'ft' && styles.toggleTextActive]}>{content.unitFt}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.visualContainer}>
                        <View style={styles.heightDisplay}>
                            <Text style={styles.heightText}>{height}</Text>
                            <Text style={styles.heightUnit}>{unit}</Text>
                        </View>

                        <View style={styles.contentRow}>
                            <View style={styles.characterContainer}>
                                <Image
                                    source={require('../../../assets/Frame 94.png')}
                                    style={[
                                        styles.characterImage,
                                        { transform: [{ scale: (height / 170) * 0.9 }] }
                                    ]}
                                    resizeMode="contain"
                                />
                            </View>

                            <View style={styles.scaleContainer} {...panResponder.panHandlers}>
                                <View style={styles.scaleRuler}>
                                    {[190, 180, 170, 160, 150, 140].map((val) => (
                                        <View key={val} style={styles.scaleMark}>
                                            <Text style={styles.scaleLabel}>{val}</Text>
                                            <View style={styles.scaleLine} />
                                        </View>
                                    ))}
                                </View>

                                <View style={[styles.activeLine, { top: ((190 - height) / (190 - 140)) * 240 }]} />
                                <View style={[styles.activeCircle, { top: ((190 - height) / (190 - 140)) * 240 - 4 }]} />
                            </View>
                        </View>
                    </View>
                </View>
            </EvaluationLayout>
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
        borderRadius: 25,
        padding: 4,
        width: 160,
        marginBottom: 40,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 21,
    },
    toggleButtonActive: {
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleText: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#999',
    },
    toggleTextActive: {
        color: '#000',
    },
    visualContainer: {
        flex: 1,
        width: '100%',
        position: 'relative',
    },
    heightDisplay: {
        position: 'absolute',
        top: 50,
        left: 10,
        flexDirection: 'row',
        alignItems: 'baseline',
        zIndex: 10,
    },
    heightText: {
        fontSize: 32,
        fontFamily: 'Cairo_700Bold',
    },
    heightUnit: {
        fontSize: 16,
        fontFamily: 'Cairo_400Regular',
        marginLeft: 5,
    },
    contentRow: {
        flexDirection: 'row',
        height: '100%',
    },
    characterContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible',
    },
    characterImage: {
        width: 180,
        height: 400,
    },
    scaleContainer: {
        width: 80,
        height: 240,
        marginTop: 50,
        position: 'relative',
    },
    scaleRuler: {
        height: '100%',
        justifyContent: 'space-between',
    },
    scaleMark: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    scaleLabel: {
        fontSize: 14,
        color: '#999',
        marginRight: 10,
    },
    scaleLine: {
        width: 20,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    activeLine: {
        position: 'absolute',
        left: -180,
        right: 0,
        height: 2,
        backgroundColor: '#DDA0DD',
    },
    activeCircle: {
        position: 'absolute',
        right: -4,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#DDA0DD',
        borderWidth: 2,
        borderColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    }
});
