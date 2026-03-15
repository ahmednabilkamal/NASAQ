import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';

export default function Home() {
  const router = useRouter();
  const { languageCode } = useLanguage();
  const content = (pageData as any)[languageCode]?.page4 || (pageData as any)['en'].page4;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{content.title}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/pages/onboarding/genderSelection')}

      >
        <Text style={styles.buttonText}>{content.buttonText}</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.screenPadding,
  },
  text: {
    fontSize: FontSizes.h2,
    fontFamily: 'Cairo_700Bold',
    lineHeight: LineHeights.h2,
    letterSpacing: 0,
    color: '#064E3B',
    marginBottom: Spacing.verticalLg,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#064E3B',
    paddingHorizontal: scale(30),
    paddingVertical: scaleVertical(12),
    borderRadius: BorderRadius.sm,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: FontSizes.body,
    fontFamily: 'Cairo_700Bold',
    lineHeight: LineHeights.body,
    letterSpacing: 0,
  },
});
