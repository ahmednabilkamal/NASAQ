import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});



export const bodyTypeData = {
  male: [
    { key: 1, source: require("../assets/menbodytype11.png") },
    { key: 2, source: require("../assets/malebodytype12.png") },
    { key: 3, source: require("../assets/malevbodytype13.png") },
    { key: 4, source: require("../assets/menbodytype21.png") },
    { key: 5, source: require("../assets/malebodytype22.png") },
  ],
  female: [
    { key: 1, source: require("../assets/womenbodytype11.png") },
    { key: 2, source: require("../assets/womenbodytype12.png") },
    { key: 3, source: require("../assets/womenbodytype13.png") },
    { key: 4, source: require("../assets/womenbodytype21.png") },
    { key: 5, source: require("../assets/womernbodytype22.png") },
  ]
}