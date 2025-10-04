import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { useState, useRef, useEffect } from 'react';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PlayerController() {
  const [position, setPosition] = useState({ x: SCREEN_WIDTH / 2 - 20, y: SCREEN_HEIGHT / 2 - 20 });
  const [activeDirections, setActiveDirections] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  
  const animatedX = useRef(new Animated.Value(SCREEN_WIDTH / 2 - 20)).current;
  const animatedY = useRef(new Animated.Value(SCREEN_HEIGHT / 2 - 20)).current;

  const MOVE_SPEED = 5;
  const CHARACTER_SIZE = 40;

  // Keyboard controls for laptop/desktop
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (e) => {
        if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveDirections(prev => ({ ...prev, up: true }));
        }
        if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveDirections(prev => ({ ...prev, down: true }));
        }
        if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
          e.preventDefault();
          setActiveDirections(prev => ({ ...prev, left: true }));
        }
        if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
          e.preventDefault();
          setActiveDirections(prev => ({ ...prev, right: true }));
        }
      };

      const handleKeyUp = (e) => {
        if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
          setActiveDirections(prev => ({ ...prev, up: false }));
        }
        if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
          setActiveDirections(prev => ({ ...prev, down: false }));
        }
        if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
          setActiveDirections(prev => ({ ...prev, left: false }));
        }
        if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
          setActiveDirections(prev => ({ ...prev, right: false }));
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, []);

  // Movement loop
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;

        if (activeDirections.left) {
          newX = Math.max(0, prev.x - MOVE_SPEED);
        }
        if (activeDirections.right) {
          newX = Math.min(SCREEN_WIDTH - CHARACTER_SIZE, prev.x + MOVE_SPEED);
        }
        if (activeDirections.up) {
          newY = Math.max(0, prev.y - MOVE_SPEED);
        }
        if (activeDirections.down) {
          newY = Math.min(SCREEN_HEIGHT - CHARACTER_SIZE - 120, prev.y + MOVE_SPEED);
        }

        if (newX !== prev.x) {
          Animated.timing(animatedX, {
            toValue: newX,
            duration: 0,
            useNativeDriver: false,
          }).start();
        }

        if (newY !== prev.y) {
          Animated.timing(animatedY, {
            toValue: newY,
            duration: 0,
            useNativeDriver: false,
          }).start();
        }

        return { x: newX, y: newY };
      });
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(interval);
  }, [activeDirections]);

  const handlePressIn = (direction) => {
    setActiveDirections(prev => ({ ...prev, [direction]: true }));
  };

  const handlePressOut = (direction) => {
    setActiveDirections(prev => ({ ...prev, [direction]: false }));
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
            <TouchableOpacity 
              style={[styles.arrowButton, activeDirections.up && styles.arrowButtonActive]} 
              onPressIn={() => handlePressIn('up')}
              onPressOut={() => handlePressOut('up')}
            >
              <Text style={styles.arrow}>↑</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.arrowRow}>
            <TouchableOpacity 
              style={[styles.arrowButton, activeDirections.left && styles.arrowButtonActive]} 
              onPressIn={() => handlePressIn('left')}
              onPressOut={() => handlePressOut('left')}
            >
              <Text style={styles.arrow}>←</Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity 
              style={[styles.arrowButton, activeDirections.right && styles.arrowButtonActive]} 
              onPressIn={() => handlePressIn('right')}
              onPressOut={() => handlePressOut('right')}
            >
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.arrowRow}>
            <TouchableOpacity 
              style={[styles.arrowButton, activeDirections.down && styles.arrowButtonActive]} 
              onPressIn={() => handlePressIn('down')}
              onPressOut={() => handlePressOut('down')}
            >
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