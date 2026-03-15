import { scaleFont } from './responsive';
import { TextStyle } from 'react-native';

export const FontSizes = {
  display: scaleFont(48),
  displayMedium: scaleFont(32),
  h1: scaleFont(24),
  h2: scaleFont(22),
  h3: scaleFont(19),
  h4: scaleFont(18),
  body: scaleFont(14),
  bodyLarge: scaleFont(16),
  bodySmall: scaleFont(11),
  button: scaleFont(18),
  input: scaleFont(16),
  caption: scaleFont(10),
  label: scaleFont(13),
};

export const LineHeights = {
  display: scaleFont(56),
  displayMedium: scaleFont(40),
  h1: scaleFont(32),
  h2: scaleFont(28),
  h3: scaleFont(27),
  h4: scaleFont(24),
  body: scaleFont(22),
  bodyLarge: scaleFont(24),
  bodySmall: scaleFont(16),
  button: scaleFont(24),
  caption: scaleFont(14),
};

export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
};

export const TextStyles: Record<string, TextStyle> = {
  display: {
    fontSize: FontSizes.display,
    lineHeight: LineHeights.display,
    fontFamily: 'Cairo_700Bold',
    letterSpacing: LetterSpacing.normal,
  },
  displayMedium: {
    fontSize: FontSizes.displayMedium,
    lineHeight: LineHeights.displayMedium,
    fontFamily: 'Cairo_700Bold',
    letterSpacing: LetterSpacing.normal,
  },
  h1: {
    fontSize: FontSizes.h1,
    lineHeight: LineHeights.h1,
    fontFamily: 'Cairo_700Bold',
    letterSpacing: LetterSpacing.normal,
  },
  h2: {
    fontSize: FontSizes.h2,
    lineHeight: LineHeights.h2,
    fontFamily: 'Cairo_700Bold',
    letterSpacing: LetterSpacing.normal,
  },
  h3: {
    fontSize: FontSizes.h3,
    lineHeight: LineHeights.h3,
    fontFamily: 'Cairo_700Bold',
    letterSpacing: LetterSpacing.normal,
  },
  h4: {
    fontSize: FontSizes.h4,
    lineHeight: LineHeights.h4,
    fontFamily: 'Cairo_700Bold',
    letterSpacing: LetterSpacing.normal,
  },
  body: {
    fontSize: FontSizes.body,
    lineHeight: LineHeights.body,
    fontFamily: 'Cairo_400Regular',
    letterSpacing: LetterSpacing.normal,
  },
  bodyBold: {
    fontSize: FontSizes.body,
    lineHeight: LineHeights.body,
    fontFamily: 'Cairo_700Bold',
    letterSpacing: LetterSpacing.normal,
  },
  bodySemiBold: {
    fontSize: FontSizes.body,
    lineHeight: LineHeights.body,
    fontFamily: 'Cairo_600SemiBold',
    letterSpacing: LetterSpacing.normal,
  },
  bodyLarge: {
    fontSize: FontSizes.bodyLarge,
    lineHeight: LineHeights.bodyLarge,
    fontFamily: 'Cairo_400Regular',
    letterSpacing: LetterSpacing.normal,
  },
  caption: {
    fontSize: FontSizes.bodySmall,
    lineHeight: LineHeights.bodySmall,
    fontFamily: 'Cairo_400Regular',
    letterSpacing: LetterSpacing.normal,
  },
  captionBold: {
    fontSize: FontSizes.bodySmall,
    lineHeight: LineHeights.bodySmall,
    fontFamily: 'Cairo_700Bold',
    letterSpacing: LetterSpacing.normal,
  },
  captionSemiBold: {
    fontSize: FontSizes.bodySmall,
    lineHeight: LineHeights.bodySmall,
    fontFamily: 'Cairo_600SemiBold',
    letterSpacing: LetterSpacing.normal,
  },
  button: {
    fontSize: FontSizes.button,
    lineHeight: LineHeights.button,
    fontFamily: 'Cairo_700Bold',
    letterSpacing: LetterSpacing.normal,
  },
  input: {
    fontSize: FontSizes.input,
    lineHeight: LineHeights.body,
    fontFamily: 'Cairo_400Regular',
    letterSpacing: LetterSpacing.normal,
  },
  label: {
    fontSize: FontSizes.label,
    lineHeight: LineHeights.bodySmall,
    fontFamily: 'Cairo_400Regular',
    letterSpacing: LetterSpacing.normal,
  },
};
