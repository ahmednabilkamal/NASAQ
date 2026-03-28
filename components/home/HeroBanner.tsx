import React, { useRef, useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ImageBackground,
    Dimensions,
    FlatList,
    ViewToken,
    Pressable,
} from 'react-native';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width; // full width banner
// Constrain banner height so it doesn't block vertical scrolling on some devices.
const BANNER_HEIGHT = Math.min(220, Math.max(140, Math.round(width * 0.42)));

interface Slide {
    id: string;
    title?: string;
    imageUri?: any;
    link?: string;
}

interface HeroBannerProps {
    slides: Slide[];
    onPressSlide?: (slide: Slide) => void;
    fallbackTitle?: string;
}

export default function HeroBanner({ slides, onPressSlide, fallbackTitle }: HeroBannerProps) {
    if (!slides || slides.length === 0) {
        return null;
    }

    // Ensure at least 1 slide.
    const slideData = slides.map((s, i) => ({
        id: s.id ?? String(i),
        title: s.title || fallbackTitle || '',
        imageUri: s.imageUri,
        link: s.link,
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
        <Pressable
            onPress={() => onPressSlide?.(item)}
            disabled={!onPressSlide || !item.link}
        >
            <View style={styles.slide}>
                {item.imageUri ? (
                    <ImageBackground
                        source={item.imageUri}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.imageFallback} />
                )}
            </View>
        </Pressable>
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
        paddingHorizontal: 0,
        marginTop: 4,
        marginBottom: 0,
    },
    bannerContent: {
        borderRadius: 0,
        overflow: 'hidden',
    },
    slide: {
        width: BANNER_WIDTH,
        height: BANNER_HEIGHT,
        maxHeight: BANNER_HEIGHT,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageFallback: {
        width: '100%',
        height: '100%',
        backgroundColor: '#064E3B',
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
