import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SpotDetailsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Spot Details Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 