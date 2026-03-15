import { scale, scaleVertical } from './responsive';

export const Spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
  xxxl: scale(30),
  xxxxl: scale(40),
  verticalXs: scaleVertical(4),
  verticalSm: scaleVertical(8),
  verticalMd: scaleVertical(12),
  verticalLg: scaleVertical(16),
  verticalXl: scaleVertical(20),
  verticalXxl: scaleVertical(24),
  verticalXxxl: scaleVertical(30),
  verticalXxxxl: scaleVertical(40),
  cardPadding: scale(16),
  cardMargin: scale(16),
  screenPadding: scale(20),
  screenPaddingHorizontal: scale(20),
  screenPaddingVertical: scaleVertical(20),
  sectionMargin: scaleVertical(30),
  sectionMarginSmall: scaleVertical(20),
  gapXs: scale(4),
  gapSm: scale(6),
  gapMd: scale(8),
  gapLg: scale(10),
  gapXl: scale(12),
  gapXxl: scale(16),
};

export const BorderRadius = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
  xxxl: scale(30),
  round: scale(100),
  button: scale(50),
  card: scale(20),
  cardSmall: scale(12),
  input: scale(8),
  badge: scale(12),
};

export const IconSizes = {
  xs: scale(16),
  sm: scale(20),
  md: scale(24),
  lg: scale(28),
  xl: scale(32),
  xxl: scale(40),
  xxxl: scale(48),
};

export const ButtonSizes = {
  heightSmall: scaleVertical(36),
  heightMedium: scaleVertical(44),
  heightLarge: scaleVertical(52),
  paddingHorizontalSmall: scale(16),
  paddingHorizontalMedium: scale(20),
  paddingHorizontalLarge: scale(24),
  paddingVerticalSmall: scaleVertical(8),
  paddingVerticalMedium: scaleVertical(12),
  paddingVerticalLarge: scaleVertical(16),
};

export const InputSizes = {
  height: scaleVertical(48),
  heightSmall: scaleVertical(40),
  heightLarge: scaleVertical(56),
  paddingHorizontal: scale(16),
  paddingVertical: scaleVertical(12),
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(1) },
    shadowOpacity: 0.1,
    shadowRadius: scale(2),
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.15,
    shadowRadius: scale(8),
    elevation: 8,
  },
  xlarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(8) },
    shadowOpacity: 0.2,
    shadowRadius: scale(16),
    elevation: 15,
  },
};

export const AvatarSizes = {
  xs: scale(24),
  sm: scale(32),
  md: scale(40),
  lg: scale(50),
  xl: scale(60),
  xxl: scale(80),
  xxxl: scale(100),
};

export const ComponentSizes = {
  bottomNavHeight: scaleVertical(75),
  bottomNavCenterButton: scale(65),
  bottomNavCenterMarginTop: scaleVertical(-55),
  tabBarHeight: scaleVertical(48),
  headerHeight: scaleVertical(56),
  cardMinHeight: scaleVertical(120),
  bannerMinHeight: scaleVertical(160),
};
