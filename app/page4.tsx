import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Venus Style!</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Start Exploring</Text>
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
