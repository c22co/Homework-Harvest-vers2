import { Image } from 'expo-image';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RainbowProps {
  visible: boolean;
  cameraX?: number;
  cameraY?: number;
}

export default function Rainbow({ visible, cameraX = 0, cameraY = 0 }: RainbowProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in the rainbow
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
      
      // Auto hide after 5 seconds
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      // Fade out immediately
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.rainbow,
        {
          opacity: fadeAnim,
          transform: [
            { translateX: -cameraX * 0.1 }, // Slight parallax effect
            { translateY: -cameraY * 0.1 },
          ],
        },
      ]}
      pointerEvents="none"
    >
      <Image
        source={require('@/assets/images/background/rainbow.png')}
        style={styles.rainbowImage}
        contentFit="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  rainbow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6, // Cover upper portion of sky
    zIndex: -10, // Behind grass but in front of sky
  },
  rainbowImage: {
    width: '100%',
    height: '100%',
  },
});