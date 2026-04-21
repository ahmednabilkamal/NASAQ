import { useAuth } from '@/config/authContext';
import { getInitialRoute } from '@/config/navigationFlow';
import { href } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const SPLASH_MIN_DURATION_MS = 600;

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();
  const hasNavigatedRef = useRef(false);
  const imageOpacity = useSharedValue(0);
  const imageScale = useSharedValue(0.8);

  useEffect(() => {
    imageOpacity.value = withTiming(1, { duration: 2000 });
    imageScale.value = withTiming(1, { duration: 2000 });

    const navigateToNextScreen = async () => {
      if (loading || hasNavigatedRef.current) return;

      console.log('🚀 Determining initial route...');
      console.log('Is Authenticated:', isAuthenticated);

      const route = await getInitialRoute(isAuthenticated, user);
      console.log('📍 Navigating to:', route);

      hasNavigatedRef.current = true;
      router.replace(href(route));
    };

    const timer = setTimeout(() => {
      navigateToNextScreen();
    }, SPLASH_MIN_DURATION_MS);

    return () => clearTimeout(timer);
  }, [loading, isAuthenticated, user]);

  const imageStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
    transform: [{ scale: imageScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, imageStyle]}>
        <Image
          source={require('@/assets/nasaq_logo.jpg')}
          style={styles.image}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand.primaryDark,
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
