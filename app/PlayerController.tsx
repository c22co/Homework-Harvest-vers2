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

// Map and camera constants
const MAP_WIDTH = 2000;  // Large map that player can traverse
const MAP_HEIGHT = 1500;
const CAMERA_CENTER_X = SCREEN_WIDTH / 2;
const CAMERA_CENTER_Y = SCREEN_HEIGHT / 2;

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
      // Distribute trees across the larger map area
      { x: 200, y: 150, scale: 1.5 + Math.random() * 0.5, flip: Math.random() < 0.5 },
      { x: 400, y: 300, scale: 1.2 + Math.random() * 0.8, flip: Math.random() < 0.5 },
      { x: 150, y: 400, scale: 1.8 + Math.random() * 0.7, flip: Math.random() < 0.5 },
      { x: 600, y: 200, scale: 1.4 + Math.random() * 0.6, flip: Math.random() < 0.5 },
      { x: 800, y: 500, scale: 1.6 + Math.random() * 0.9, flip: Math.random() < 0.5 },
      { x: 1200, y: 300, scale: 1.3 + Math.random() * 0.7, flip: Math.random() < 0.5 },
      { x: 1000, y: 800, scale: 1.7 + Math.random() * 0.8, flip: Math.random() < 0.5 },
      { x: 1500, y: 400, scale: 1.5 + Math.random() * 0.6, flip: Math.random() < 0.5 },
      { x: 300, y: 900, scale: 1.4 + Math.random() * 0.9, flip: Math.random() < 0.5 },
      { x: 1700, y: 700, scale: 1.8 + Math.random() * 0.5, flip: Math.random() < 0.5 },
      { x: 500, y: 1200, scale: 1.6 + Math.random() * 0.7, flip: Math.random() < 0.5 },
      { x: 1300, y: 1000, scale: 1.2 + Math.random() * 0.8, flip: Math.random() < 0.5 },
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

  // Floor boundary collision detection - prevent player from going into sky area
  const checkFloorBoundary = (px: number, py: number) => {
    // Define the floor area boundaries (adjust these values based on your map_floor.png)
    // These coordinates define where the floor ends and sky begins
    const FLOOR_TOP_BOUNDARY = MAP_HEIGHT * 0.29; // Sky area is top 30% of map
    const FLOOR_LEFT_BOUNDARY = MAP_WIDTH * 0; // 5% margin on left
    const FLOOR_RIGHT_BOUNDARY = MAP_WIDTH * 1; // 5% margin on right
    const FLOOR_BOTTOM_BOUNDARY = MAP_HEIGHT * 1; // 5% margin on bottom
    
    // Check if player would be in sky area (too high)
    if (py < FLOOR_TOP_BOUNDARY) {
      return false; // Cannot move into sky
    }
    
    // Check if player would be outside floor boundaries
    if (px < FLOOR_LEFT_BOUNDARY || px > FLOOR_RIGHT_BOUNDARY - CHARACTER_SIZE) {
      return false; // Cannot move outside floor horizontally
    }
    
    if (py > FLOOR_BOTTOM_BOUNDARY - CHARACTER_SIZE) {
      return false; // Cannot move outside floor at bottom
    }
    
    return true; // Position is valid on floor
  };

  // Find a safe spawn position for character (not inside trees)
  const findSafeSpawnPosition = () => {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const x = Math.random() * (MAP_WIDTH - CHARACTER_SIZE);
      const y = Math.random() * (MAP_HEIGHT - CHARACTER_SIZE);
      
      if (!checkTreeCollision(x, y) && checkFloorBoundary(x, y)) {
        return { x, y };
      }
      attempts++;
    }
    
    // Fallback to safe floor position if no safe position found
    return {
      x: MAP_WIDTH / 2 - CHARACTER_SIZE / 2,
      y: MAP_HEIGHT * 0.7, // Place in middle-lower area of floor
    };
  };

  const [initial] = useState(() => findSafeSpawnPosition());
  const [position] = useState(initial);
  const positionRef = useRef({ ...initial });

  // Camera system - track world position but render player centered
  const cameraX = useRef(new Animated.Value(-positionRef.current.x + CAMERA_CENTER_X)).current;
  const cameraY = useRef(new Animated.Value(-positionRef.current.y + CAMERA_CENTER_Y)).current;
  
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
    // Clamp to map boundaries
    const clampedX = Math.max(0, Math.min(MAP_WIDTH - CHARACTER_SIZE, x));
    const clampedY = Math.max(0, Math.min(MAP_HEIGHT - CHARACTER_SIZE, y));
    
    // Check if new position would collide with trees or go outside floor
    if (checkTreeCollision(clampedX, clampedY) || !checkFloorBoundary(clampedX, clampedY)) {
      return; // Don't move if it would cause collision or leave floor
    }
    
    positionRef.current = { x: clampedX, y: clampedY };
    
    // Update player position in world coordinates
    animatedX.setValue(clampedX);
    animatedY.setValue(clampedY);
    
    // Calculate desired camera position (centered on player)
    const desiredCameraX = -clampedX + CAMERA_CENTER_X;
    const desiredCameraY = -clampedY + CAMERA_CENTER_Y;
    
    // Camera boundary constraints to prevent showing areas beyond the floor
    const CAMERA_MARGIN = 0; // How close to edge before camera stops following
    
    // Calculate camera bounds based on screen size and map size
    const minCameraX = -(MAP_WIDTH - SCREEN_WIDTH + CAMERA_MARGIN);
    const maxCameraX = -CAMERA_MARGIN;
    const minCameraY = -(MAP_HEIGHT - SCREEN_HEIGHT + CAMERA_MARGIN);
    const maxCameraY = -CAMERA_MARGIN;
    
    // Clamp camera position to stay within bounds
    const clampedCameraX = Math.max(minCameraX, Math.min(maxCameraX, desiredCameraX));
    const clampedCameraY = Math.max(minCameraY, Math.min(maxCameraY, desiredCameraY));
    
    // Update camera with bounded position
    cameraX.setValue(clampedCameraX);
    cameraY.setValue(clampedCameraY);
    
    checkCollision(clampedX, clampedY);
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
      if (!checkTreeCollision(testX, newY) && checkFloorBoundary(testX, newY)) {
        newX = testX;
        moved = true;
      }
    }
    if (keysPressed.current['d'] || keysPressed.current['arrowright']) {
      const testX = Math.min(MAP_WIDTH - CHARACTER_SIZE, newX + delta);
      if (!checkTreeCollision(testX, newY) && checkFloorBoundary(testX, newY)) {
        newX = testX;
        moved = true;
      }
    }

    // Try vertical movement
    if (keysPressed.current['w'] || keysPressed.current['arrowup']) {
      const testY = Math.max(0, newY - delta);
      if (!checkTreeCollision(newX, testY) && checkFloorBoundary(newX, testY)) {
        newY = testY;
        moved = true;
      }
    }
    if (keysPressed.current['s'] || keysPressed.current['arrowdown']) {
      const testY = Math.min(MAP_HEIGHT - CHARACTER_SIZE, newY + delta);
      if (!checkTreeCollision(newX, testY) && checkFloorBoundary(newX, testY)) {
        newY = testY;
        moved = true;
      }
    }

    if (moved) {
      // Use applyPosition to update both player position and camera
      applyPosition(newX, newY);
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

  // Updated nudge function with tree collision and floor boundary
  const nudge = (dx: number, dy: number) => {
    const newX = Math.min(Math.max(0, positionRef.current.x + dx), MAP_WIDTH - CHARACTER_SIZE);
    const newY = Math.min(Math.max(0, positionRef.current.y + dy), MAP_HEIGHT - CHARACTER_SIZE);
    
    // Only move if it doesn't collide with trees and stays on floor
    if (!checkTreeCollision(newX, newY) && checkFloorBoundary(newX, newY)) {
      applyPosition(newX, newY);
    }
  };

  // Helper function to check if pumpkin position is safe (not in trees and on floor)
  const isPumpkinPositionSafe = (x: number, y: number) => {
    const pumpkinRect = {
      left: x,
      right: x + PUMPKIN_SIZE,
      top: y,
      bottom: y + PUMPKIN_SIZE,
    };

    // Check floor boundary first
    if (!checkFloorBoundary(x, y)) {
      return false;
    }

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
      {/* Camera-transformed game world */}
      <Animated.View 
        style={[
          styles.gameArea, 
          { 
            transform: [
              { translateX: cameraX },
              { translateY: cameraY }
            ]
          }
        ]} 
        pointerEvents="box-none"
      >
        {/* Background layers */}
        {/* Sky layer - behind floor */}
        <Image 
          source={require('@/assets/images/background/map_sky.png')} 
          style={{
            position: 'absolute',
            width: MAP_WIDTH,
            height: MAP_HEIGHT,
            left: 0,
            top: 0,
            zIndex: -12
          }}
          resizeMode="stretch"
        />
        
        {/* Floor layer - in front of sky */}
        <Image 
          source={require('@/assets/images/background/map_floor.png')} 
          style={{
            position: 'absolute',
            width: MAP_WIDTH,
            height: MAP_HEIGHT,
            left: 0,
            top: 0,
            zIndex: -11
          }}
          resizeMode="stretch"
        />
        
        {/* Trees positioned in world coordinates */}
        {treePositions?.map?.((t, i) => (
          <DecorTree key={i} x={t.x} y={t.y} scale={t.scale} flip={t.flip} />
        ))}

        {/* Player character positioned in world coordinates but appears centered due to camera */}
        <Animated.View
          style={[
            styles.character,
            { left: animatedX as any, top: animatedY as any },
          ]}
          pointerEvents="none"
        >
          <Image source={getCurrentCostumeImage()} style={styles.characterImage} resizeMode="contain" />
        </Animated.View>

        {/* Pumpkins positioned in world coordinates */}
        {pumpkins?.map?.((p) => (
          <Pumpkin key={p.id} x={p.x} y={p.y} />
        ))}
      </Animated.View>

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