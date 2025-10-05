import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';

export default function DecorTree({
  x,
  y,
  scale = 1,
  flip = false,
  dead = false,
}: {
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  dead?: boolean;
}) {
  const size = 96 * scale;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const deadImageOpacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (dead) {
      // Fade out alive tree, then fade in dead tree
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(deadImageOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset to alive state
      fadeAnim.setValue(1);
      deadImageOpacity.setValue(0);
    }
  }, [dead, fadeAnim, deadImageOpacity]);

  return (
    <View pointerEvents="none" style={[styles.tree, { left: x, top: y, width: size, height: size }]}>
      {/* Alive tree image */}
      <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
        <Image
          source={require('@/assets/images/Tree.png')}
          style={[styles.image, { width: size, height: size, transform: [{ scaleX: flip ? -1 : 1 }] }]}
        />
      </Animated.View>
      
      {/* Dead tree image */}
      <Animated.View style={[styles.imageContainer, styles.deadImageContainer, { opacity: deadImageOpacity }]}>
        <Image
          source={require('@/assets/images/dead_tree.png')}
          style={[styles.image, { width: size, height: size, transform: [{ scaleX: flip ? -1 : 1 }] }]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  tree: {
    position: 'absolute',
    zIndex: 1,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  deadImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  image: {
    resizeMode: 'contain',
  },
});