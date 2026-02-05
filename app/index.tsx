import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const imageOpacity = useSharedValue(0);
  const imageScale = useSharedValue(0.8);

  useEffect(() => {
    imageOpacity.value = withTiming(1, { duration: 2000 });
    imageScale.value = withTiming(1, { duration: 2000 });

    const timer = setTimeout(() => {
      router.replace('/pages/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const imageStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
    transform: [{ scale: imageScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, imageStyle]}>
        <Image
          source={require('../assets/venus-logo.png')}
          style={styles.image}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00503C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width * 0.6,
    height: width * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
