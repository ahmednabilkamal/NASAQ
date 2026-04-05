import type { ImageSourcePropType } from 'react-native';

const SKIN_FEMALE: Record<string, ImageSourcePropType> = {
    light: require('../assets/femalecolor1.png'),
    fair: require('../assets/femalecolor2.png'),
    medium: require('../assets/femalecolor3.png'),
    tan: require('../assets/femalecolor4.png'),
};

const SKIN_MALE: Record<string, ImageSourcePropType> = {
    light: require('../assets/malecolor1.png'),
    fair: require('../assets/malecolor2.png'),
    medium: require('../assets/malecolor3.png'),
    tan: require('../assets/malecolor4.png'),
};

const SHAPE_FEMALE: Record<string, ImageSourcePropType> = {
    hourglass: require('../assets/womenbodytype11.png'),
    pear: require('../assets/womenbodytype12.png'),
    apple: require('../assets/womenbodytype13.png'),
    rectangle: require('../assets/womenbodytype21.png'),
    inverted_triangle: require('../assets/womernbodytype22.png'),
};

const SHAPE_MALE: Record<string, ImageSourcePropType> = {
    hourglass: require('../assets/menbodytype11.png'),
    pear: require('../assets/malebodytype12.png'),
    apple: require('../assets/malevbodytype13.png'),
    rectangle: require('../assets/menbodytype21.png'),
    inverted_triangle: require('../assets/malebodytype22.png'),
};

export function getSkinToneImageSource(
    skinTone: string | undefined | null,
    gender: string | undefined | null
): ImageSourcePropType | null {
    const tone = String(skinTone || '').toLowerCase().trim();
    if (!tone) return null;
    const map = gender === 'male' ? SKIN_MALE : SKIN_FEMALE;
    return map[tone] ?? null;
}

export function getBodyShapeImageSource(
    bodyShape: string | undefined | null,
    gender: string | undefined | null
): ImageSourcePropType | null {
    const shape = String(bodyShape || '')
        .toLowerCase()
        .trim()
        .replace(/[\s-]+/g, '_');
    if (!shape) return null;
    const map = gender === 'male' ? SHAPE_MALE : SHAPE_FEMALE;
    return map[shape] ?? null;
}
