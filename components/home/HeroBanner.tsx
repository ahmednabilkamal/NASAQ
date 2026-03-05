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
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    {imageUri && (
                        <View style={styles.imageContainer}>
                            <ImageBackground
                                source={imageUri}
                                style={styles.image}
                                resizeMode="contain"
                            />
                        </View>
                    )}

                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>{subtitle}</Text>
                    </View>

                    <View style={styles.dotsContainer}>
                        <View style={[styles.dot, styles.dotActive]} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                    </View>
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
        minHeight: 180,
        padding: 24,
        alignItems: 'center',
    },
    imageContainer: {
        width: 140,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '120%',
        height: '110%',
        position: 'absolute',
        bottom: -10,
        left: -20,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 20,
        fontFamily: 'Cairo_700Bold',
        color: '#fff',
        textAlign: 'left',
        lineHeight: 28,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'left',
    },
    button: {
        display: 'none', // Hide button as per image 3 (it uses dots instead)
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 6,
        position: 'absolute',
        bottom: 12,
        alignSelf: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    dotActive: {
        width: 16,
        backgroundColor: '#FFF',
    }
});

