import React, { useRef } from 'react';
import { Animated, Pressable, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  isFavorite: boolean;
  onPress: () => void;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
  style?: StyleProp<ViewStyle>;
  hitSlop?: { top?: number; bottom?: number; left?: number; right?: number };
};

export default function AnimatedFavoriteButton({
  isFavorite,
  onPress,
  size = 20,
  activeColor = '#FF4458',
  inactiveColor = '#999',
  style,
  hitSlop,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const bump = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.26, friction: 5, tension: 120, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
      hitSlop={hitSlop}
      style={({ pressed }) => [style, pressed && { opacity: 0.88 }]}
      onPress={() => {
        bump();
        onPress();
      }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={size}
          color={isFavorite ? activeColor : inactiveColor}
        />
      </Animated.View>
    </Pressable>
  );
}
