import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';

export default function Home() {
  const router = useRouter();
  const { languageCode } = useLanguage();
  const content = (pageData as any)[languageCode]?.page4 || (pageData as any)['en'].page4;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{content.title}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/pages/login')}
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
    padding: 20,
  },
  text: {
    fontSize: 23,
    fontFamily: 'Cairo_700Bold',
    lineHeight: 23,
    letterSpacing: 0,
    color: '#064E3B',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Cairo_700Bold',
    lineHeight: 14,
    letterSpacing: 0,
  },
});
