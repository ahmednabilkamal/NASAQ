import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import EvaluationLayout from '../../../components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WeightPage() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.weightSelection || (pageData as any)['en'].weightSelection;

    const [unit, setUnit] = useState<'lbs' | 'kg'>('kg');
    const [weight, setWeight] = useState(65.7);

    return (
        <SafeAreaView style={styles.container}>

            <EvaluationLayout
                title={content.title}
                subtitle={content.subtitle}
                currentStep={4}
                totalSteps={10}
                onNext={() => router.push('/pages/onboarding/page6' as any)}
                nextButtonText={content.nextButton}
            >
                <View>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleButton, unit === 'lbs' && styles.toggleButtonActive]}
                            onPress={() => setUnit('lbs')}
                        >
                            <Text style={[styles.toggleText, unit === 'lbs' && styles.toggleTextActive]}>lbs</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleButton, unit === 'kg' && styles.toggleButtonActive]}
                            onPress={() => setUnit('kg')}
                        >
                            <Text style={[styles.toggleText, unit === 'kg' && styles.toggleTextActive]}>kg</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bmiSection}>
                        <Text style={styles.bmiTitle}>{content.bmiText}</Text>
                        <View style={styles.bmiScale}>
                            <View style={[styles.bmiSegment, { backgroundColor: '#FFD700', borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }]}><Text style={styles.bmiLabel}>30</Text></View>
                            <View style={[styles.bmiSegment, { backgroundColor: '#FF8C00' }]}><Text style={styles.bmiLabel}>25</Text></View>
                            <View style={[styles.bmiSegment, { backgroundColor: '#90EE90' }]}><Text style={styles.bmiLabel}>20</Text></View>
                            <View style={[styles.bmiSegment, { backgroundColor: '#DDA0DD', borderTopRightRadius: 5, borderBottomRightRadius: 5 }]}><Text style={styles.bmiLabel}>15</Text></View>
                            <View style={styles.bmiPointer} />
                        </View>
                        <View style={styles.bmiSubLabels}>
                            <Text style={styles.bmiSubLabel}>{content.bmiCategories.obese}</Text>
                            <Text style={styles.bmiSubLabel}>{content.bmiCategories.overweight}</Text>
                            <Text style={styles.bmiSubLabel}>{content.bmiCategories.normal}</Text>
                            <Text style={styles.bmiSubLabel}>{content.bmiCategories.underweight}</Text>
                        </View>
                    </View>

                    <View style={styles.weightDisplay}>
                        <Text style={styles.weightText}>{weight}</Text>
                        <Text style={styles.weightUnit}>{unit.toUpperCase()}</Text>
                    </View>

                    <View style={styles.rulerContainer}>
                        <View style={styles.rulerLine} />
                        <View style={styles.rulerNumbers}>
                            {[64, 65, 66, 67].map((n) => (
                                <Text key={n} style={styles.rulerNumber}>{n}</Text>
                            ))}
                        </View>
                        <View style={styles.activePointer} />
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
    bmiSection: {
        width: '100%',
        marginBottom: 60,
    },
    bmiTitle: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    bmiScale: {
        flexDirection: 'row',
        height: 10,
        width: '100%',
        position: 'relative',
    },
    bmiSegment: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    bmiLabel: {
        fontSize: 10,
        position: 'absolute',
        top: -15,
    },
    bmiPointer: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#000',
        borderWidth: 2,
        borderColor: '#FFF',
        top: -1,
        left: '60%', // Approximately at 65.7 natural position
    },
    bmiSubLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    bmiSubLabel: {
        fontSize: 10,
        color: '#999',
        width: '25%',
        textAlign: 'center',
    },
    weightDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 40,
    },
    weightText: {
        fontSize: 48,
        fontFamily: 'Cairo_700Bold',
    },
    weightUnit: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        marginLeft: 10,
    },
    rulerContainer: {
        width: '100%',
        height: 100,
        justifyContent: 'center',
        position: 'relative',
    },
    rulerLine: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    rulerNumbers: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        position: 'absolute',
        bottom: 10,
    },
    rulerNumber: {
        fontSize: 16,
        color: '#999',
    },
    activePointer: {
        position: 'absolute',
        bottom: 40,
        left: '50%',
        width: 2,
        height: 80,
        backgroundColor: '#DDA0DD',
    }
});
