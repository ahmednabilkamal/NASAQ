import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

function useSkeletonPulse() {
  const opacity = useRef(new Animated.Value(0.38)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.85, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.32, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return opacity;
}

type SkeletonBoxProps = {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export function SkeletonBox({ width = '100%', height = 14, borderRadius = 8, style }: SkeletonBoxProps) {
  const opacity = useSkeletonPulse();
  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

export function SkeletonCircle({ size = 48, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  const opacity = useSkeletonPulse();
  return (
    <Animated.View style={[styles.base, { width: size, height: size, borderRadius: size / 2, opacity }, style]} />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#E5E7EB',
  },
});
