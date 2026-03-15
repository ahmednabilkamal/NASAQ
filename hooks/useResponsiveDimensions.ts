import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';
import {
  scale,
  scaleVertical,
  scaleFont,
  scaleModerate,
  hp,
  wp,
  isSmallDevice,
  isLargeDevice,
  isTablet,
} from '@/utils/responsive';

export const useResponsiveDimensions = () => {
  const { width, height } = useWindowDimensions();

  return useMemo(
    () => ({
      width,
      height,

      scale,
      scaleVertical,
      scaleFont,
      scaleModerate,
      hp,
      wp,

      isSmall: width < 380,
      isMedium: width >= 380 && width < 414,
      isLarge: width >= 414 && width < 768,
      isTablet: width >= 768,

      isSmallDevice,
      isLargeDevice,
      isTablet: isTablet,

      isLandscape: width > height,
      isPortrait: height > width,
    }),
    [width, height]
  );
};

export const useResponsivePercentage = () => {
  const { width, height } = useWindowDimensions();

  return useMemo(
    () => ({
      widthPercent: (percent: number) => (width * percent) / 100,
      heightPercent: (percent: number) => (height * percent) / 100,
      width,
      height,
    }),
    [width, height]
  );
};
