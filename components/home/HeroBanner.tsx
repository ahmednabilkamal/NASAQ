import React, { useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Dimensions,
    FlatList,
    ViewToken,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 40; // horizontal padding 20 each side

interface Slide {
    id: string;
    title: string;
}

interface HeroBannerProps {
    title: string;
    subtitle?: string;
    buttonText?: string;
    imageUri?: any;
    onPress?: () => void;
    /** Extra slides beyond the first. Pass an array of titles to repeat the banner. */
    slides?: string[];
}

export default function HeroBanner({
    title,
    imageUri,
    slides = [],
}: HeroBannerProps) {
    // Build slide data: first slide uses `title`, rest from `slides` prop.
    // Default to 4 slides (all with same title + same image) to match the dot count.
    const allTitles = [title, ...slides];
    // Pad to at least 4 slides using the same title/image
    const slideData: Slide[] = Array.from({ length: Math.max(allTitles.length, 4) }, (_, i) => ({
        id: String(i),
        title: allTitles[i] ?? title,
    }));

    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const onViewableItemsChanged = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setActiveIndex(viewableItems[0].index);
            }
        },
        []
    );

    const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

    const renderSlide = ({ item }: { item: Slide }) => (
        <LinearGradient
            colors={['#064E3B', '#047857']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.slide}
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
                <Text style={styles.title}>{item.title}</Text>
            </View>
        </LinearGradient>
    );

    return (
        <View style={styles.container}>
            <View style={styles.bannerContent}>
                <FlatList
                    ref={flatListRef}
                    data={slideData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderSlide}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    getItemLayout={(_, index) => ({
                        length: BANNER_WIDTH,
                        offset: BANNER_WIDTH * index,
                        index,
                    })}
                />

                {/* Centred dots */}
                <View style={styles.dotsContainer}>
                    {slideData.map((_, i) => (
                        <View
                            key={i}
                            style={[styles.dot, i === activeIndex && styles.dotActive]}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginTop: 4,          // reduced top margin
        marginBottom: 0,
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
    slide: {
        width: BANNER_WIDTH,
        flexDirection: 'row',
        minHeight: 160,         // slightly shorter to reduce y padding feel
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 36,      // leave room for dots inside
        alignItems: 'center',
    },
    imageContainer: {
        width: 130,
        height: 160,
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
        paddingLeft: 8,
    },
    title: {
        fontSize: 19,
        fontFamily: 'Cairo_700Bold',
        color: '#fff',
        textAlign: 'left',
        lineHeight: 27,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 6,
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,               // full width so alignSelf centres properly
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
    dotActive: {
        width: 16,
        backgroundColor: '#FFF',
    },
});
