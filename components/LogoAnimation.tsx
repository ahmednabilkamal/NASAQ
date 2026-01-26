'use client';

import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

export default function LogoAnimation() {
  const scaleValue = useRef(new Animated.Value(0.1)).current;

  useEffect(() => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [scaleValue]);

  return (
    <View className="flex-1 items-center justify-center bg-slate-900">
      <Animated.Image
        source={require('./assets/logo.png')} 
        style={{
          width: 120,
          height: 120,
          transform: [{ scale: scaleValue }],
        }}
        className="rounded-lg"
      />
    </View>
  );
}
