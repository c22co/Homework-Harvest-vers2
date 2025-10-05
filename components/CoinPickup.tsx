import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';

export default function CoinPickup({
  x,
  y,
  amount,
  onDone,
}: {
  x: number;
  y: number;
  amount: number;
  onDone: () => void;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -40, duration: 800, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start(() => {
      onDone();
    });
  }, [translateY, opacity, scale, onDone]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { left: x, top: y, transform: [{ translateY }, { scale }] },
        { opacity },
      ]}
    >
      <View style={styles.row}>
        <Image source={require('@/assets/images/Coin.png')} style={styles.icon} />
        <Text style={styles.amount}>+{amount}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 999,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  amount: {
    fontWeight: '700',
    color: '#111',
  },
});