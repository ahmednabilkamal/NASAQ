import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import EvaluationLayout from '../../../components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StyleIdentityPage() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.fashionIdentity || (pageData as any)['en'].fashionIdentity;

    const STYLES = [
        { id: '1', name: content.styles.modernCasual, image: require('../../../assets/stylewomen1.png') },
        { id: '2', name: content.styles.formalClassic, image: require('../../../assets/stylewomen2.png') },
        { id: '3', name: content.styles.modernCasual, image: require('../../../assets/stylewomen1.png') },
        { id: '4', name: content.styles.modernCasual, image: require('../../../assets/stylewomen1.png') },
        { id: '5', name: content.styles.formalClassic, image: require('../../../assets/stylewomen2.png') },
        { id: '6', name: content.styles.modernCasual, image: require('../../../assets/stylewomen1.png') },
    ];

    const [selected, setSelected] = useState<string | null>(null);

    const handleSelect = (id: string) => {
        setSelected(id);
    };

    return (
        <SafeAreaView style={styles.container}>
            <EvaluationLayout
                title={content.title}
                subtitle={content.subtitle}
                currentStep={10}
                totalSteps={10}
                onNext={() => router.push('/pages/tabs/stylists' as any)}
                nextButtonText={content.nextButton}
            >
                <View style={{ flex: 1 }}>
                    <FlatList
                        data={STYLES}
                        numColumns={3}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        columnWrapperStyle={styles.columnWrapper}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.card, selected === item.id && styles.cardSelected]}
                                onPress={() => handleSelect(item.id)}
                            >
                                <View style={styles.stylePlaceholder}>
                                    <Image
                                        source={item.image}
                                        style={styles.cardImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.overlay}>
                                        <Text style={styles.styleName}>{item.name}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </EvaluationLayout>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    card: {
        width: '31%',
        aspectRatio: 0.8,
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    cardSelected: {
        borderColor: '#000',
    },
    stylePlaceholder: {
        flex: 1,
        backgroundColor: '#E0E0E0',
        justifyContent: 'flex-end',
    },
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingVertical: 8,
        alignItems: 'center',
    },
    styleName: {
        fontSize: 10,
        color: '#FFF',
        fontFamily: 'Cairo_700Bold',
        textAlign: 'center',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    }
});
