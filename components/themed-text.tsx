import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

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
    fontSize: 14,
    lineHeight: 14,
    fontFamily: 'Cairo_700Bold',
    letterSpacing: 0,
  },
  defaultSemiBold: {
    fontSize: 14,
    lineHeight: 14,
    fontFamily: 'Cairo_700Bold',
    letterSpacing: 0,
  },
  title: {
    fontSize: 23,
    lineHeight: 23,
    fontFamily: 'Cairo_700Bold',
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 14,
    fontFamily: 'Cairo_700Bold',
    letterSpacing: 0,
  },
  link: {
    fontSize: 14,
    lineHeight: 14,
    color: '#0a7ea4',
    fontFamily: 'Cairo_700Bold',
    letterSpacing: 0,
  },
});
