import React, { useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    FlatList,
    ViewToken,
    useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';

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
    slides?: string[];
}

export default function HeroBanner({
    title,
    imageUri,
    slides = [],
}: HeroBannerProps) {
    const { width } = useWindowDimensions();
    const BANNER_WIDTH = width - scale(40);

    const allTitles = [title, ...slides];
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
            style={[styles.slide, { width: BANNER_WIDTH }]}
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

const createStyles = () => StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.xl,
        marginTop: scale(4),
        marginBottom: 0,
    },
    bannerContent: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    slide: {
        flexDirection: 'row',
        minHeight: scaleVertical(160),
        paddingHorizontal: Spacing.xl,
        paddingTop: scale(16),
        paddingBottom: scale(36),
        alignItems: 'center',
    },
    imageContainer: {
        width: scale(130),
        height: scaleVertical(160),
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '120%',
        height: '110%',
        position: 'absolute',
        bottom: scale(-10),
        left: scale(-20),
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: scale(8),
    },
    title: {
        fontSize: FontSizes.h3,
        fontFamily: 'Cairo_700Bold',
        color: '#fff',
        textAlign: 'left',
        lineHeight: LineHeights.h3,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: scale(6),
        position: 'absolute',
        bottom: scale(10),
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: scale(6),
        height: scale(6),
        borderRadius: scale(3),
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
    dotActive: {
        width: scale(16),
        backgroundColor: '#FFF',
    },
});

const styles = createStyles();
