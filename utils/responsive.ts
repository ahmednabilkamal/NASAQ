import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const SCREEN_SIZES = {
  SMALL: 320,
  MEDIUM: 375,
  LARGE: 414,
  TABLET: 768,
};

export const isSmallDevice = SCREEN_WIDTH < SCREEN_SIZES.MEDIUM;
export const isLargeDevice = SCREEN_WIDTH >= SCREEN_SIZES.LARGE;
export const isTablet = SCREEN_WIDTH >= SCREEN_SIZES.TABLET;

export const scale = (size: number): number => {
  const scaleRatio = SCREEN_WIDTH / BASE_WIDTH;
  return PixelRatio.roundToNearestPixel(size * scaleRatio);
};

export const scaleVertical = (size: number): number => {
  const scaleRatio = SCREEN_HEIGHT / BASE_HEIGHT;
  return PixelRatio.roundToNearestPixel(size * scaleRatio);
};

export const scaleFont = (size: number, factor: number = 0.5): number => {
  const scaleRatio = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scaleRatio;

  const scaledSize = size + (newSize - size) * factor;

  const minSize = size * 0.85;
  const maxSize = size * 1.3;

  return PixelRatio.roundToNearestPixel(
    Math.min(Math.max(scaledSize, minSize), maxSize)
  );
};

export const scaleModerate = (size: number, factor: number = 0.5): number => {
  const scaled = scale(size);
  return PixelRatio.roundToNearestPixel(size + (scaled - size) * factor);
};

export const wp = (widthPercent: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * widthPercent) / 100);
};

export const hp = (heightPercent: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * heightPercent) / 100);
};

export const platformSpacing = (ios: number, android: number): number => {
  return Platform.OS === 'ios' ? scale(ios) : scale(android);
};

export const getMarginHorizontal = (value: number) => {
  return {
    marginStart: scale(value),
    marginEnd: scale(value),
  };
};

export const getPaddingHorizontal = (value: number) => {
  return {
    paddingStart: scale(value),
    paddingEnd: scale(value),
  };
};

export const getImageSize = (baseWidth: number, baseHeight: number) => {
  return {
    width: scale(baseWidth),
    height: scaleVertical(baseHeight),
  };
};

export const getScreenDimensions = () => {
  return {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  };
};
