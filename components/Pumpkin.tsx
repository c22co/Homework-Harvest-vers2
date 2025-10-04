import React from 'react';
import { Image } from 'expo-image';
import { View, StyleSheet } from 'react-native';

export default function Pumpkin({ x, y }: { x: number; y: number }) {
  return (
    <View style={[styles.pumpkin, { left: x, top: y }]}>
      <Image source={require('@/assets/images/Pumpkin.png')} style={{ width: 40, height: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  pumpkin: {
    position: 'absolute',
    width: 40,
    height: 40,
    zIndex: 5,
  },
});