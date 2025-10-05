import { useCurrency } from '@/components/CurrencyContext';
import DecorTree from '@/components/DecorTree';
import Pumpkin from '@/components/Pumpkin';
import React, { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Use require() for images with spaces in filenames
const girlImg = require('../assets/images/girl-front2.png');

// Costume images
const costumeImages = {
  default: require('../assets/images/girl-front2.png'),
  wizard: require('../assets/images/Wizard Costume 2.png'),
  cat: require('../assets/images/Cat Costume 2.png'),
  alien: require('../assets/images/Alien Costume 2.png'),
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type PumpkinItem = { id: string; x: number; y: number };

export default function PlayerController({
  pumpkins = [],
  setPumpkins = () => {},
  outfit = '🧑',
  playerRef,
  showControls = true,
}: {
  pumpkins?: PumpkinItem[];
  setPumpkins?: (updater: (prev: PumpkinItem[]) => PumpkinItem[]) => void;
  outfit?: string;
  playerRef?: React.MutableRefObject<{ 
    x: number; 
    y: number; 
    nudge: (dx: number, dy: number) => void;
    isPumpkinPositionSafe?: (x: number, y: number) => boolean;
  } | null>;
  showControls?: boolean;
}) {
  const CHARACTER_SIZE = 40;
  const PUMPKIN_SIZE = 40;
  const MOVE_SPEED_PX_PER_SEC = 240;

  // Generate trees first so we can use them for collision detection
  const generateTrees = () => {
    const basePositions = [
      // Top row
      { x: 50, y: 40, scale: 2.0 + Math.random() * 1.0, flip: Math.random() < 0.5 },
      { x: SCREEN_WIDTH / 4, y: 60, scale: 1.8 + Math.random() * 1.2, flip: Math.random() < 0.5 },
      { x: SCREEN_WIDTH / 2, y: 30, scale: 2.2 + Math.random() * 0.8, flip: Math.random() < 0.5 },
      { x: (SCREEN_WIDTH * 3) / 4, y: 70, scale: 1.6 + Math.random() * 1.4, flip: Math.random() < 0.5 },
      { x: SCREEN_WIDTH - 150, y: 50, scale: 1.9 + Math.random() * 1.1, flip: Math.random() < 0.5 },
      
      // Middle row
      { x: 100, y: SCREEN_HEIGHT / 3, scale: 1.7 + Math.random() * 1.3, flip: Math.random() < 0.5 },
      { x: SCREEN_WIDTH - 200, y: SCREEN_HEIGHT / 2.5, scale: 2.1 + Math.random() * 0.9, flip: Math.random() < 0.5 },
      
      // Bottom row
      { x: 30, y: SCREEN_HEIGHT - 250, scale: 2.3 + Math.random() * 0.7, flip: Math.random() < 0.5 },
      { x: SCREEN_WIDTH / 3, y: SCREEN_HEIGHT - 300, scale: 1.8 + Math.random() * 1.2, flip: Math.random() < 0.5 },
      { x: (SCREEN_WIDTH * 2) / 3, y: SCREEN_HEIGHT - 280, scale: 2.0 + Math.random() * 1.0, flip: Math.random() < 0.5 },
      { x: SCREEN_WIDTH - 120, y: SCREEN_HEIGHT - 220, scale: 1.9 + Math.random() * 1.1, flip: Math.random() < 0.5 },
    ];
    return basePositions;
  };

  const [treePositions] = useState(() => generateTrees());

  // Tree collision detection helper - using smaller collision box for tree trunk
  const checkTreeCollision = (px: number, py: number) => {
    const playerRect = {
      left: px,
      right: px + CHARACTER_SIZE,
      top: py,
      bottom: py + CHARACTER_SIZE,
    };

    for (const tree of treePositions) {
      // Use correct tree size (96px base) and realistic trunk dimensions
      const treeSize = 96 * tree.scale;
      const trunkWidth = treeSize * 0.12; // Narrow trunk (12% of tree width)
      const trunkHeight = treeSize * 0.25; // Trunk height (25% of tree height)
       
      // Center the trunk horizontally and position at bottom of tree
      const trunkOffsetX = (treeSize - trunkWidth) / 2;
      const trunkOffsetY = treeSize - trunkHeight;
       
      const treeRect = {
        left: tree.x + trunkOffsetX,
        right: tree.x + trunkOffsetX + trunkWidth,
        top: tree.y + trunkOffsetY,
        bottom: tree.y + treeSize,
      };

      const isColliding =
        playerRect.left < treeRect.right &&
        playerRect.right > treeRect.left &&
        playerRect.top < treeRect.bottom &&
        playerRect.bottom > treeRect.top;

      if (isColliding) {
        return true; // Collision detected
      }
    }
    return false; // No collision
  };

  // Find a safe spawn position for character (not inside trees)
  const findSafeSpawnPosition = () => {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const x = Math.random() * (SCREEN_WIDTH - CHARACTER_SIZE);
      const y = Math.random() * (SCREEN_HEIGHT - CHARACTER_SIZE);
      
      if (!checkTreeCollision(x, y)) {
        return { x, y };
      }
      attempts++;
    }
    
    // Fallback to center if no safe position found
    return {
      x: SCREEN_WIDTH / 2 - CHARACTER_SIZE / 2,
      y: SCREEN_HEIGHT / 2 - CHARACTER_SIZE / 2,
    };
  };

  const [initial] = useState(() => findSafeSpawnPosition());
  const [position] = useState(initial);
  const positionRef = useRef({ ...initial });

  const animatedX = useRef(new Animated.Value(positionRef.current.x)).current;
  const animatedY = useRef(new Animated.Value(positionRef.current.y)).current;
  const { add_currency, currentOutfit } = useCurrency();
  const displayOutfit = currentOutfit ?? outfit;
  
  // Get the appropriate costume image
  const getCurrentCostumeImage = () => {
    const outfitKey = currentOutfit as keyof typeof costumeImages;
    return costumeImages[outfitKey] || costumeImages.default;
  };

  const pumpkinsRef = useRef<PumpkinItem[]>(pumpkins || []);
  useEffect(() => {
    pumpkinsRef.current = pumpkins || [];
  }, [pumpkins]);

  const keysPressed = useRef<Record<string, boolean>>({});
  const rafId = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const checkCollision = (px: number, py: number) => {
    const playerRect = {
      left: px,
      right: px + CHARACTER_SIZE,
      top: py,
      bottom: py + CHARACTER_SIZE,
    };

    for (const pumpkin of [...pumpkinsRef.current]) {
      const pRect = {
        left: pumpkin.x,
        right: pumpkin.x + PUMPKIN_SIZE,
        top: pumpkin.y,
        bottom: pumpkin.y + PUMPKIN_SIZE,
      };

      const isColliding =
        playerRect.left < pRect.right &&
        playerRect.right > pRect.left &&
        playerRect.top < pRect.bottom &&
        playerRect.bottom > pRect.top;

      if (isColliding) {
        setPumpkins(prev => prev.filter(p => p.id !== pumpkin.id));
        const reward = Math.floor(Math.random() * 50) + 1;
        add_currency(reward);
      }
    }
  };

  // Update position with tree collision checking
  const applyPosition = (x: number, y: number) => {
    // Check if new position would collide with trees
    if (checkTreeCollision(x, y)) {
      return; // Don't move if it would cause collision
    }
    
    positionRef.current.x = x;
    positionRef.current.y = y;
    animatedX.setValue(x);
    animatedY.setValue(y);
    checkCollision(x, y);
  };

  // rAF loop for smooth movement with collision detection
  const loop = (time: number) => {
    if (lastTimeRef.current == null) lastTimeRef.current = time;
    const dtMs = time - lastTimeRef.current;
    lastTimeRef.current = time;
    const dt = dtMs / 1000;
    let moved = false;

    let newX = positionRef.current.x;
    let newY = positionRef.current.y;
    const delta = MOVE_SPEED_PX_PER_SEC * dt;

    // Try horizontal movement first
    if (keysPressed.current['a'] || keysPressed.current['arrowleft']) {
      const testX = Math.max(0, newX - delta);
      if (!checkTreeCollision(testX, newY)) {
        newX = testX;
        moved = true;
      }
    }
    if (keysPressed.current['d'] || keysPressed.current['arrowright']) {
      const testX = Math.min(SCREEN_WIDTH - CHARACTER_SIZE, newX + delta);
      if (!checkTreeCollision(testX, newY)) {
        newX = testX;
        moved = true;
      }
    }

    // Try vertical movement
    if (keysPressed.current['w'] || keysPressed.current['arrowup']) {
      const testY = Math.max(0, newY - delta);
      if (!checkTreeCollision(newX, testY)) {
        newY = testY;
        moved = true;
      }
    }
    if (keysPressed.current['s'] || keysPressed.current['arrowdown']) {
      const testY = Math.min(SCREEN_HEIGHT - CHARACTER_SIZE, newY + delta);
      if (!checkTreeCollision(newX, testY)) {
        newY = testY;
        moved = true;
      }
    }

    if (moved) {
      positionRef.current.x = newX;
      positionRef.current.y = newY;
      animatedX.setValue(newX);
      animatedY.setValue(newY);
      checkCollision(newX, newY);
      rafId.current = requestAnimationFrame(loop);
    } else {
      lastTimeRef.current = null;
      rafId.current = null;
    }
  };

  const startLoopIfNeeded = () => {
    if (rafId.current == null) {
      lastTimeRef.current = null;
      rafId.current = requestAnimationFrame(loop);
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (!keysPressed.current[k]) {
        keysPressed.current[k] = true;
        startLoopIfNeeded();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Updated nudge function with tree collision
  const nudge = (dx: number, dy: number) => {
    const newX = Math.min(Math.max(0, positionRef.current.x + dx), SCREEN_WIDTH - CHARACTER_SIZE);
    const newY = Math.min(Math.max(0, positionRef.current.y + dy), SCREEN_HEIGHT - CHARACTER_SIZE);
    
    // Only move if it doesn't collide with trees
    if (!checkTreeCollision(newX, newY)) {
      applyPosition(newX, newY);
    }
  };

  // Helper function to check if pumpkin position is safe (not in trees)
  const isPumpkinPositionSafe = (x: number, y: number) => {
    const pumpkinRect = {
      left: x,
      right: x + PUMPKIN_SIZE,
      top: y,
      bottom: y + PUMPKIN_SIZE,
    };

    for (const tree of treePositions) {
      // Use correct tree size (96px base) and realistic trunk dimensions
      const treeSize = 96 * tree.scale;
      const trunkWidth = treeSize * 0.12; // Narrow trunk (12% of tree width)
      const trunkHeight = treeSize * 0.25; // Trunk height (25% of tree height)
      
      // Center the trunk horizontally and position at bottom of tree
      const trunkOffsetX = (treeSize - trunkWidth) / 2;
      const trunkOffsetY = treeSize - trunkHeight;
      
      const treeRect = {
        left: tree.x + trunkOffsetX,
        right: tree.x + trunkOffsetX + trunkWidth,
        top: tree.y + trunkOffsetY,
        bottom: tree.y + treeSize,
      };

      const isColliding =
        pumpkinRect.left < treeRect.right &&
        pumpkinRect.right > treeRect.left &&
        pumpkinRect.top < treeRect.bottom &&
        pumpkinRect.bottom > treeRect.top;

      if (isColliding) {
        return false;
      }
    }
    return true;
  };

  // Expose collision check function via playerRef for pumpkin spawning
  useEffect(() => {
    if (!playerRef) return;
    playerRef.current = {
      x: positionRef.current.x,
      y: positionRef.current.y,
      nudge: (dx: number, dy: number) => {
        const px = Math.min(Math.max(0, positionRef.current.x + dx), SCREEN_WIDTH - CHARACTER_SIZE);
        const py = Math.min(Math.max(0, positionRef.current.y + dy), SCREEN_HEIGHT - CHARACTER_SIZE);
        if (!checkTreeCollision(px, py)) {
          applyPosition(px, py);
        }
      },
      // Add function to check safe pumpkin positions
      isPumpkinPositionSafe,
    };

    const iv = setInterval(() => {
      if (playerRef.current) {
        playerRef.current.x = positionRef.current.x;
        playerRef.current.y = positionRef.current.y;
      }
    }, 50);
    return () => {
      clearInterval(iv);
      if (playerRef) playerRef.current = null;
    };
  }, [playerRef]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.gameArea} pointerEvents="box-none">
        {treePositions?.map?.((t, i) => (
          <DecorTree key={i} x={t.x} y={t.y} scale={t.scale} flip={t.flip} />
        ))}

        <Animated.View
          style={[
            styles.character,
            { left: animatedX as any, top: animatedY as any },
          ]}
          pointerEvents="none"
        >
          <Image source={getCurrentCostumeImage()} style={styles.characterImage} resizeMode="contain" />
        </Animated.View>

        {pumpkins?.map?.((p) => (
          <Pumpkin key={p.id} x={p.x} y={p.y} />
        ))}
      </View>

      {showControls && (
        <View style={styles.controlsContainer} pointerEvents="box-none">
          <TouchableOpacity style={styles.arrowButton} onPress={() => nudge(-20, 0)}>
            <Text>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrowButton} onPress={() => nudge(20, 0)}>
            <Text>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrowButton} onPress={() => nudge(0, -20)}>
            <Text>↑</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrowButton} onPress={() => nudge(0, 20)}>
            <Text>↓</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  gameArea: { flex: 1, position: 'relative' },
  character: { position: 'absolute', width: 40, height: 40, justifyContent: 'center', alignItems: 'center', zIndex: -1 },
  characterText: { fontSize: 40 },
  characterImage: { width: 40, height: 40 },
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 9999,
    elevation: 9999,
    pointerEvents: 'auto',
  },
  arrowButton: {
    width: 45,
    height: 45,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderRadius: 22.5,
  },
});