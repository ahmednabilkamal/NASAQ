import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { FontSizes, LineHeights } from '@/utils/typography';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: FontSizes.body,
    lineHeight: LineHeights.body,
    fontFamily: 'Cairo_700Bold',
    letterSpacing: 0,
  },
  defaultSemiBold: {
    fontSize: FontSizes.body,
    lineHeight: LineHeights.body,
    fontFamily: 'Cairo_700Bold',
    letterSpacing: 0,
  },
  title: {
    fontSize: FontSizes.h2,
    lineHeight: LineHeights.h2,
    fontFamily: 'Cairo_700Bold',
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: FontSizes.body,
    lineHeight: LineHeights.body,
    fontFamily: 'Cairo_700Bold',
    letterSpacing: 0,
  },
  link: {
    fontSize: FontSizes.body,
    lineHeight: LineHeights.body,
    color: '#0a7ea4',
    fontFamily: 'Cairo_700Bold',
    letterSpacing: 0,
  },
});
