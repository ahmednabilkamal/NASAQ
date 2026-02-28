import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useAuth } from '@/config/authContext';
import { getInitialRoute } from '@/config/navigationFlow';

const { width } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const imageOpacity = useSharedValue(0);
  const imageScale = useSharedValue(0.8);

  useEffect(() => {
    imageOpacity.value = withTiming(1, { duration: 2000 });
    imageScale.value = withTiming(1, { duration: 2000 });

    const navigateToNextScreen = async () => {
      // Wait for auth to finish loading
      if (loading) return;

      console.log('🚀 Determining initial route...');
      console.log('Is Authenticated:', isAuthenticated);

      const route = await getInitialRoute(isAuthenticated);
      console.log('📍 Navigating to:', route);

      router.replace(route as any);
    };

    const timer = setTimeout(() => {
      navigateToNextScreen();
    }, 2500); // Slightly longer to show the splash animation

    return () => clearTimeout(timer);
  }, [loading, isAuthenticated]);

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
