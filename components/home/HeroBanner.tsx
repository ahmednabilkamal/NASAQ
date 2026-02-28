import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface HeroBannerProps {
    title: string;
    subtitle: string;
    buttonText: string;
    imageUri?: any;
    onPress?: () => void;
}

export default function HeroBanner({ title, subtitle, buttonText, imageUri, onPress }: HeroBannerProps) {
    return (
        <View style={styles.container}>
            <View style={styles.bannerContent}>
                <LinearGradient
                    colors={['#064E3B', '#047857']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>{subtitle}</Text>
                        <TouchableOpacity style={styles.button} onPress={onPress}>
                            <Text style={styles.buttonText}>{buttonText}</Text>
                        </TouchableOpacity>
                    </View>

                    {imageUri && (
                        <View style={styles.imageContainer}>
                            <ImageBackground
                                source={imageUri}
                                style={styles.image}
                                resizeMode="contain"
                            />
                        </View>
                    )}
                </LinearGradient>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    bannerContent: {
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    gradient: {
        flexDirection: 'row',
        minHeight: 160,
        padding: 20,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#fff',
        textAlign: 'right',
        lineHeight: 28,
    },
    subtitle: {
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'right',
        marginTop: 4,
    },
    button: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-end',
        marginTop: 12,
    },
    buttonText: {
        fontSize: 12,
        fontFamily: 'Cairo_600SemiBold',
        color: '#064E3B',
    },
    imageContainer: {
        width: 120,
        height: 140,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});
