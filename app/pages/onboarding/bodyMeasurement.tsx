import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, LayoutChangeEvent, useWindowDimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Line, Circle } from 'react-native-svg';
import EvaluationLayout from '../../../components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGender } from '@/config/genderContext';
import { useMeasurements } from '@/hooks/onboarding/useMeasurements';
import { useAuth } from '@/config/authContext';
import { FontSizes } from '@/utils/typography';
import { scaleVertical } from '@/utils/responsive';

const FEMALE_POINTS = {
    shoulder: { bodyXRatio: 0.62, bodyYRatio: 0.185, inputYRatio: 0.14 },
    chest: { bodyXRatio: 0.74, bodyYRatio: 0.255, inputYRatio: 0.22 },
    arm: { bodyXRatio: 0.550, bodyYRatio: 0.395, inputYRatio: 0.32 },
    waist: { bodyXRatio: 0.610, bodyYRatio: 0.402, inputYRatio: 0.40 },
    hip: { bodyXRatio: 0.750, bodyYRatio: 0.490, inputYRatio: 0.50 },
    thigh: { bodyXRatio: 0.630, bodyYRatio: 0.630, inputYRatio: 0.62 },
    leg: { bodyXRatio: 0.660, bodyYRatio: 0.790, inputYRatio: 0.75 },
};

const MALE_POINTS = {
    shoulder: { bodyXRatio: 0.670, bodyYRatio: 0.200, inputYRatio: 0.14 },
    chest: { bodyXRatio: 0.775, bodyYRatio: 0.275, inputYRatio: 0.25 },
    arm: { bodyXRatio: 0.550, bodyYRatio: 0.370, inputYRatio: 0.32 },
    waist: { bodyXRatio: 0.750, bodyYRatio: 0.419, inputYRatio: 0.42 },
    hip: { bodyXRatio: 0.785, bodyYRatio: 0.520, inputYRatio: 0.52 },
    thigh: { bodyXRatio: 0.600, bodyYRatio: 0.640, inputYRatio: 0.62 },
    leg: { bodyXRatio: 0.600, bodyYRatio: 0.765, inputYRatio: 0.72 },
};

const INPUT_X_RATIO = 0.35;

export default function MeasurementsPage() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.personalMeasurements || (pageData as any)['en'].personalMeasurements;
    const { gender } = useGender();
    const { measurements, updateMeasurement } = useMeasurements();
    const { updateProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const { width: windowWidth } = useWindowDimensions();
    const isSmallScreen = windowWidth < 380;

    // Calculate minimum container height to prevent overlaps
    const MIN_INPUT_SPACING = 48; // Minimum spacing between inputs
    const NUM_INPUTS = 7;
    const minContainerHeight = MIN_INPUT_SPACING * (NUM_INPUTS + 2); // Extra space for top and bottom

    const handleNext = async () => {
        setSaving(true);
        try {
            const body_measurements: any = {};
            Object.keys(measurements).forEach(key => {
                body_measurements[key] = Number(measurements[key as keyof typeof measurements]);
            });
            await updateProfile({ body_measurements });
            router.push('/pages/onboarding/styleIdentity' as any);

        } catch (error) {
            console.error('Failed to save measurements:', error);
        } finally {
            setSaving(false);
        }
    };

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const points = gender === 'female' ? FEMALE_POINTS : MALE_POINTS;

    const measurementItems = [
        { key: 'shoulder', label: content.shoulder, value: measurements.shoulder, point: points.shoulder },
        { key: 'chest', label: content.chest, value: measurements.chest, point: points.chest, highlight: true },
        { key: 'waist', label: content.waist, value: measurements.waist, point: points.waist },
        { key: 'arm', label: content.arm, value: measurements.arm, point: points.arm },
        { key: 'hip', label: content.buttocks, value: measurements.hip, point: points.hip },
        { key: 'thigh', label: content.thigh, value: measurements.thigh, point: points.thigh },
        { key: 'leg', label: content.leg, value: measurements.leg, point: points.leg },
    ];

    const handleLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setDimensions({ width, height });
    };

    const getPosition = (xRatio: number, yRatio: number) => ({
        x: xRatio * dimensions.width,
        y: yRatio * dimensions.height,
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <EvaluationLayout
                title={content.title}
                subtitle={content.subtitle}
                currentStep={6}
                totalSteps={7}


                onNext={handleNext}
                nextButtonText={saving ? '...' : content.nextButton}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <View style={[styles.mainContainer, { minHeight: minContainerHeight }]} onLayout={handleLayout}>
                        {/* Body Image - using stretch to fill container exactly */}
                        <Image
                            source={gender === 'female'
                                ? require('../../../assets/femalefigurine.png')
                                : require('../../../assets/male_figurine.png')
                            }
                            style={[styles.bodyImage, { width: isSmallScreen ? '38%' : '45%' }]}
                            resizeMode="contain"
                        />

                        {/* Only render SVG and inputs after we have dimensions */}
                        {dimensions.width > 0 && (
                            <>
                                {/* SVG Layer for Lines and Dots */}
                                <Svg style={StyleSheet.absoluteFill}>
                                    {measurementItems.map((item, index) => {
                                        const bodyPos = getPosition(item.point.bodyXRatio, item.point.bodyYRatio);
                                        const inputY = MIN_INPUT_SPACING * (index + 1);
                                        const inputPos = { x: INPUT_X_RATIO * dimensions.width, y: inputY + 16 };

                                        return (
                                            <React.Fragment key={item.key}>
                                                {/* Line from input to body */}
                                                <Line
                                                    x1={inputPos.x}
                                                    y1={inputPos.y}
                                                    x2={bodyPos.x}
                                                    y2={bodyPos.y}
                                                    stroke="#888"
                                                    strokeWidth="1"
                                                />
                                                {/* Dot on body */}
                                                <Circle
                                                    cx={bodyPos.x}
                                                    cy={bodyPos.y}
                                                    r="5"
                                                    fill="#000"
                                                />
                                            </React.Fragment>
                                        );
                                    })}
                                </Svg>

                                {/* Input boxes - absolutely positioned with fixed spacing */}
                                {measurementItems.map((item, index) => {
                                    const inputY = MIN_INPUT_SPACING * (index + 1);

                                    return (
                                        <View
                                            key={item.key}
                                            style={[
                                                styles.inputWrapper,
                                                { top: inputY, left: 5 }
                                            ]}
                                        >
                                            <Text style={styles.label}>{item.label}: {content.unit}</Text>
                                            <TextInput
                                                style={[styles.valueInput, item.highlight && styles.inputHighlight]}
                                                value={item.value}
                                                onChangeText={(v) => updateMeasurement(item.key as any, v)}
                                                keyboardType="numeric"
                                                placeholder="0"
                                                placeholderTextColor="#999"
                                            />
                                        </View>
                                    );
                                })}
                            </>
                        )}
                    </View>
                </ScrollView>
            </EvaluationLayout>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: scaleVertical(20),
    },
    mainContainer: {
        flex: 1,
        position: 'relative',
    },
    bodyImage: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '45%',
        height: '100%',
    },
    inputWrapper: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingLeft: 10,
    },
    label: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
        width: 65,
        textAlign: 'right',
    },
    valueInput: {
        width: 48,
        height: 34,
        backgroundColor: '#FFF',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_700Bold',
        paddingHorizontal: 4,
        paddingVertical: 0,
        borderWidth: 1.5,
        borderColor: '#DDD',
        color: '#000',
    },
    inputHighlight: {
        borderWidth: 2,
        borderColor: '#000',
        backgroundColor: '#FFF',
    },
});
