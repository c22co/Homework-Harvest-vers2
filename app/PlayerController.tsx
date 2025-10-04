import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { useCurrency } from '@/components/CurrencyContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PlayerController({ pumpkins, setPumpkins }) {
  const [position, setPosition] = useState({ x: SCREEN_WIDTH / 2 - 20, y: SCREEN_HEIGHT / 2 - 20 });
  const animatedX = useRef(new Animated.Value(SCREEN_WIDTH / 2 - 20)).current;
  const animatedY = useRef(new Animated.Value(SCREEN_HEIGHT / 2 - 20)).current;
  const { add_currency } = useCurrency();

  const MOVE_SPEED = 20;
  const CHARACTER_SIZE = 40;
  const PUMPKIN_SIZE = 40;

  // Collision detection
  const checkCollision = (x, y) => {
    pumpkins.forEach(pumpkin => {
      const dx = Math.abs(x - pumpkin.x);
      const dy = Math.abs(y - pumpkin.y);

      // Check if the player overlaps with the pumpkin
      if (dx < (CHARACTER_SIZE / 2 + PUMPKIN_SIZE / 2) && dy < (CHARACTER_SIZE / 2 + PUMPKIN_SIZE / 2)) {
        console.log(`Collision detected! Player: (${x}, ${y}), Pumpkin: (${pumpkin.x}, ${pumpkin.y})`);
        // Remove pumpkin
        setPumpkins(prev => prev.filter(p => p.id !== pumpkin.id));
        // Add random currency
        const reward = Math.floor(Math.random() * 50) + 1;
        add_currency(reward);
      }
    });
  };

  const moveLeft = () => {
    setPosition(prev => {
      const newX = Math.max(0, prev.x - MOVE_SPEED);
      Animated.timing(animatedX, {
        toValue: newX,
        duration: 100,
        useNativeDriver: false,
      }).start();
      checkCollision(newX, prev.y);
      return { ...prev, x: newX };
    });
  };

  const moveRight = () => {
    setPosition(prev => {
      const newX = Math.min(SCREEN_WIDTH - CHARACTER_SIZE, prev.x + MOVE_SPEED);
      Animated.timing(animatedX, {
        toValue: newX,
        duration: 100,
        useNativeDriver: false,
      }).start();
      checkCollision(newX, prev.y);
      return { ...prev, x: newX };
    });
  };

  const moveUp = () => {
    setPosition(prev => {
      const newY = Math.max(0, prev.y - MOVE_SPEED);
      Animated.timing(animatedY, {
        toValue: newY,
        duration: 100,
        useNativeDriver: false,
      }).start();
      checkCollision(prev.x, newY);
      return { ...prev, y: newY };
    });
  };

  const moveDown = () => {
    setPosition(prev => {
      const newY = Math.min(SCREEN_HEIGHT - CHARACTER_SIZE - 150, prev.y + MOVE_SPEED);
      Animated.timing(animatedY, {
        toValue: newY,
        duration: 100,
        useNativeDriver: false,
      }).start();
      checkCollision(prev.x, newY);
      return { ...prev, y: newY };
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.gameArea}>
        <Animated.View
          style={[
            styles.character,
            {
              left: animatedX,
              top: animatedY,
            },
          ]}
        >
          <Text style={styles.characterText}>🧑</Text>
        </Animated.View>
      </View>
      <View style={styles.controlsContainer}>
        <View style={styles.arrowContainer}>
          <View style={styles.arrowRow}>
            <TouchableOpacity style={styles.arrowButton} onPress={moveUp}>
              <Text style={styles.arrow}>↑</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.arrowRow}>
            <TouchableOpacity style={styles.arrowButton} onPress={moveLeft}>
              <Text style={styles.arrow}>←</Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity style={styles.arrowButton} onPress={moveRight}>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.arrowRow}>
            <TouchableOpacity style={styles.arrowButton} onPress={moveDown}>
              <Text style={styles.arrow}>↓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Keyboard hint for desktop */}
      {Platform.OS === 'web' && (
        <View style={styles.keyboardHint}>
          <Text style={styles.hintText}>Use WASD or Arrow Keys to move</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#90EE90',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  character: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterText: {
    fontSize: 40,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  arrowContainer: {
    alignItems: 'center',
  },
  arrowRow: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    marginVertical: 3,
  },
  arrowButton: {
    width: 45,
    height: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  arrowButtonActive: {
    backgroundColor: 'rgba(100, 200, 255, 0.9)',
  },
  arrow: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  spacer: {
    width: 45,
  },
  keyboardHint: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    fontSize: 12,
  },
});