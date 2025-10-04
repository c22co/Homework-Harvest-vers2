import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

export default function DecorTree({
  x,
  y,
  scale = 1,
  flip = false,
}: {
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
}) {
  const size = 96 * scale; // base size, adjust as needed

  return (
    <View
      pointerEvents="none"
      style={[
        styles.tree,
        {
          left: x,
          top: y,
          width: size,
          height: size,
        },
      ]}
    >
      <Image
        source={require('@/assets/images/Tree.png')}
        style={[
          styles.image,
          { width: size, height: size, transform: [{ scaleX: flip ? -1 : 1 }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tree: {
    position: 'absolute',
    zIndex: 1, // behind player (player should have higher zIndex)
  },
  image: {
    resizeMode: 'contain',
  },
});