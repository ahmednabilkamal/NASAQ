import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import EvaluationLayout from '../../../components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGender } from '@/config/genderContext';

export default function MeasurementsPage() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.personalMeasurements || (pageData as any)['en'].personalMeasurements;
    const { gender } = useGender();

    const [measurements, setMeasurements] = useState({
        shoulder: '18',
        chest: '26',
        waist: '15',
        arm: '8',
        hip: '8',
        thigh: '8',
        leg: '8',
    });

    const handleUpdate = (field: string, value: string) => {
        setMeasurements((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <SafeAreaView style={styles.container}>


            <EvaluationLayout
                title={content.title}
                subtitle={content.subtitle}
                currentStep={7}
                totalSteps={10}
                onNext={() => router.push('/pages/onboarding/page9' as any)}
                nextButtonText={content.nextButton}
            >
                <View style={styles.container}>
                    <View style={styles.contentRow}>
                        <View style={styles.inputsColumn}>
                            <MeasurementInput label={content.shoulder} value={measurements.shoulder} onChange={(v: string) => handleUpdate('shoulder', v)} unit={content.unit} />
                            <MeasurementInput label={content.chest} value={measurements.chest} onChange={(v: string) => handleUpdate('chest', v)} unit={content.unit} color="#E0E0E0" highlight />
                            <MeasurementInput label={content.waist} value={measurements.waist} onChange={(v: string) => handleUpdate('waist', v)} unit={content.unit} />
                            <MeasurementInput label={content.arm} value={measurements.arm} onChange={(v: string) => handleUpdate('arm', v)} unit={content.unit} />
                            <MeasurementInput label={content.buttocks} value={measurements.hip} onChange={(v: string) => handleUpdate('hip', v)} unit={content.unit} />
                            <MeasurementInput label={content.thigh} value={measurements.thigh} onChange={(v: string) => handleUpdate('thigh', v)} unit={content.unit} />
                            <MeasurementInput label={content.leg} value={measurements.leg} onChange={(v: string) => handleUpdate('leg', v)} unit={content.unit} />
                        </View>

                        <View style={styles.diagramColumn}>
                            <View style={styles.diagramPlaceholder}>
                                <Image
                                    source={gender === 'female'
                                        ? require('../../../assets/male_figurine.png')
                                        : require('../../../assets/male_figurine.png')
                                    }
                                    style={styles.avatar}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </EvaluationLayout>
        </SafeAreaView>

    );
}

function MeasurementInput({ label, value, onChange, unit, color = 'transparent', highlight = false }: any) {
    return (
        <View style={styles.inputItem}>
            <Text style={styles.inputLabel} numberOfLines={1}>{label}: {unit}</Text>
            <TextInput
                style={[styles.input, highlight && styles.inputHighlight]}
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentRow: {
        flexDirection: 'row',
        flex: 1,
    },
    inputsColumn: {
        flex: 1.2,
        justifyContent: 'center',
    },
    diagramColumn: {
        flex: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 10,
        gap: 8,
    },
    inputLabel: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
        width: 75,
    },
    input: {
        width: 40,
        height: 35,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
    },
    inputHighlight: {
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: '#FFF',
    },
    diagramPlaceholder: {
        width: '100%',
        height: '80%',
        backgroundColor: '#F9F9F9',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
    },
    placeholderText: {
        color: '#999',
        fontFamily: 'Cairo_400Regular',
    },
    avatar: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    }
});
