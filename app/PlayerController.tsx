import { useCurrency } from '@/components/CurrencyContext';
import DecorTree from '@/components/DecorTree';
import Pumpkin from '@/components/Pumpkin';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
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

// Character movement images for different directions
const characterImages = {
  idle: require('../assets/images/girl-front2.png'),
  walkingRight: require('../assets/images/girl right side.png'),
  walkingLeft: require('../assets/images/girl right side.png'), // We'll flip this horizontally
  walkingUp: require('../assets/images/girl-front2.png'), // Use front image for up
  walkingDown: require('../assets/images/girl-front2.png'), // Use front image for down
};

// Costume images - each costume will use the same image for all directions
const costumeImages = {
  default: require('../assets/images/girl-front2.png'),
  wizard: {
    front: require('../assets/images/Wizard Costume 2.png'),
    rightSide: require('../assets/images/wizard right side.png'),
  },
  cat: {
    front: require('../assets/images/Cat Costume 2.png'),
    rightSide: require('../assets/images/cat right side.png'),
  },
  alien: {
    front: require('../assets/images/Alien Costume 2.png'),
    rightSide: require('../assets/images/Alien right side.png'),
  },
};

// Costume animation settings - defines how each costume should be transformed for different directions
const costumeAnimations = {
  default: {
    idle: { image: costumeImages.default, flipX: false, scale: 1, rotation: 0 },
    walkingRight: { image: characterImages.walkingRight, flipX: false, scale: 1, rotation: 0 },
    walkingLeft: { image: characterImages.walkingRight, flipX: true, scale: 1, rotation: 0 },
    walkingUp: { image: characterImages.idle, flipX: false, scale: 1, rotation: 0 },
    walkingDown: { image: characterImages.idle, flipX: false, scale: 1, rotation: 0 },
  },
  wizard: {
    idle: { image: costumeImages.wizard.front, flipX: false, scale: 1, rotation: 0 },
    walkingRight: { image: costumeImages.wizard.rightSide, flipX: false, scale: 1, rotation: 0 },
    walkingLeft: { image: costumeImages.wizard.rightSide, flipX: true, scale: 1, rotation: 0 },
    walkingUp: { image: costumeImages.wizard.front, flipX: false, scale: 1, rotation: 0 },
    walkingDown: { image: costumeImages.wizard.front, flipX: false, scale: 1, rotation: 0 },
  },
  cat: {
    idle: { image: costumeImages.cat.front, flipX: false, scale: 1, rotation: 0 },
    walkingRight: { image: costumeImages.cat.rightSide, flipX: false, scale: 1, rotation: 0 },
    walkingLeft: { image: costumeImages.cat.rightSide, flipX: true, scale: 1, rotation: 0 },
    walkingUp: { image: costumeImages.cat.front, flipX: false, scale: 1, rotation: 0 },
    walkingDown: { image: costumeImages.cat.front, flipX: false, scale: 1, rotation: 0 },
  },
  alien: {
    idle: { image: costumeImages.alien.front, flipX: false, scale: 1, rotation: 0 },
    walkingRight: { image: costumeImages.alien.rightSide, flipX: false, scale: 1, rotation: 0 },
    walkingLeft: { image: costumeImages.alien.rightSide, flipX: true, scale: 1, rotation: 0 },
    walkingUp: { image: costumeImages.alien.front, flipX: false, scale: 1, rotation: 0 },
    walkingDown: { image: costumeImages.alien.front, flipX: false, scale: 1, rotation: 0 },
  },
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
    // Define floor boundaries - trees should only spawn in floor area, not sky
    const FLOOR_TOP_BOUNDARY = MAP_HEIGHT * 0.29; // Sky area is top 30% of map
    const FLOOR_LEFT_BOUNDARY = MAP_WIDTH * 0;
    const FLOOR_RIGHT_BOUNDARY = MAP_WIDTH * 1;
    const FLOOR_BOTTOM_BOUNDARY = MAP_HEIGHT * 1;
    
    // Define a safe zone in the center where trees won't spawn
    const centerX = SCREEN_WIDTH / 2;
    const centerY = SCREEN_HEIGHT / 2;
    const safeZoneRadius = 80; // Clear area around center for character spawning

    const trees = [];
    const numTrees = 15; // Number of trees to generate
    
    for (let i = 0; i < numTrees; i++) {
      let attempts = 0;
      const maxAttempts = 50;
      
      while (attempts < maxAttempts) {
        // Generate random position within floor boundaries
        const x = FLOOR_LEFT_BOUNDARY + Math.random() * (FLOOR_RIGHT_BOUNDARY - FLOOR_LEFT_BOUNDARY);
        const y = FLOOR_TOP_BOUNDARY + Math.random() * (FLOOR_BOTTOM_BOUNDARY - FLOOR_TOP_BOUNDARY);
        const scale = 1.2 + Math.random() * 0.8; // Random scale between 1.2 and 2.0
        
        // Check if position is outside safe zone around player spawn
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        
        if (distanceFromCenter > safeZoneRadius) {
          // Check if this tree would overlap with any existing trees
          const treeSize = 96 * scale;
          const minDistance = treeSize * 0.8; // Minimum distance between tree centers (80% of tree size)
          
          let tooClose = false;
          for (const existingTree of trees) {
            const existingTreeSize = 96 * existingTree.scale;
            const requiredDistance = (treeSize + existingTreeSize) * 0.4; // Combined radius with some spacing
            const distance = Math.sqrt((x - existingTree.x) ** 2 + (y - existingTree.y) ** 2);
            
            if (distance < requiredDistance) {
              tooClose = true;
              break;
            }
          }
          
          if (!tooClose) {
            // Valid position found - add tree
            trees.push({
              x,
              y,
              scale,
              flip: Math.random() < 0.5
            });
            break;
          }
        }
        attempts++;
      }
    }
    
    return trees;
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
    const FLOOR_BOTTOM_BOUNDARY = MAP_HEIGHT * 0.98; // 5% margin on bottom
    
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
  
  // Movement direction state for character animation
  const [movementDirection, setMovementDirection] = useState<'idle' | 'walkingLeft' | 'walkingRight' | 'walkingUp' | 'walkingDown'>('idle');
  const lastMovementRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Get the appropriate costume image and animation data
  const getCurrentCostumeAnimation = () => {
    const outfitKey = (currentOutfit || 'default') as keyof typeof costumeAnimations;
    const animations = costumeAnimations[outfitKey] || costumeAnimations.default;
    return animations[movementDirection] || animations.idle;
  };
  
  // Get the current costume image
  const getCurrentCostumeImage = () => {
    return getCurrentCostumeAnimation().image;
  };
  
  // Check if character should be flipped horizontally
  const shouldFlipCharacter = () => {
    return getCurrentCostumeAnimation().flipX;
  };
  
  // Get the scale for the current animation
  const getCurrentScale = () => {
    return getCurrentCostumeAnimation().scale;
  };
  
  // Get the rotation for the current animation
  const getCurrentRotation = () => {
    return getCurrentCostumeAnimation().rotation;
  };
  const displayOutfit = currentOutfit ?? outfit;

  const pumpkinsRef = useRef<PumpkinItem[]>(pumpkins || []);
  useEffect(() => {
    pumpkinsRef.current = pumpkins || [];
  }, [pumpkins]);

  const keysPressed = useRef<Record<string, boolean>>({});
  const rafId = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  
  // Touch control state for mobile
  const touchPressed = useRef<Record<string, boolean>>({});
  const touchRafId = useRef<number | null>(null);
  const touchLastTimeRef = useRef<number | null>(null);

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
        setMovementDirection('walkingLeft');
      }
    }
    if (keysPressed.current['d'] || keysPressed.current['arrowright']) {
      const testX = Math.min(MAP_WIDTH - CHARACTER_SIZE, newX + delta);
      if (!checkTreeCollision(testX, newY) && checkFloorBoundary(testX, newY)) {
        newX = testX;
        moved = true;
        setMovementDirection('walkingRight');
      }
    }

    // Try vertical movement
    if (keysPressed.current['w'] || keysPressed.current['arrowup']) {
      const testY = Math.max(0, newY - delta);
      if (!checkTreeCollision(newX, testY) && checkFloorBoundary(newX, testY)) {
        newY = testY;
        moved = true;
        setMovementDirection('walkingUp');
      }
    }
    if (keysPressed.current['s'] || keysPressed.current['arrowdown']) {
      const testY = Math.min(MAP_HEIGHT - CHARACTER_SIZE, newY + delta);
      if (!checkTreeCollision(newX, testY) && checkFloorBoundary(newX, testY)) {
        newY = testY;
        moved = true;
        setMovementDirection('walkingDown');
      }
    }

    if (moved) {
      // Use applyPosition to update both player position and camera
      applyPosition(newX, newY);
      rafId.current = requestAnimationFrame(loop);
    } else {
      lastTimeRef.current = null;
      rafId.current = null;
      setMovementDirection('idle');
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

  // Touch movement loop for continuous movement
  const touchLoop = (time: number) => {
    if (touchLastTimeRef.current == null) touchLastTimeRef.current = time;
    const dtMs = time - touchLastTimeRef.current;
    touchLastTimeRef.current = time;
    const dt = dtMs / 1000;
    let moved = false;

    let newX = positionRef.current.x;
    let newY = positionRef.current.y;
    const delta = MOVE_SPEED_PX_PER_SEC * dt;

    // Calculate intended movement direction from touch
    let deltaX = 0;
    let deltaY = 0;

    if (touchPressed.current['left']) {
      deltaX -= delta;
    }
    if (touchPressed.current['right']) {
      deltaX += delta;
    }
    if (touchPressed.current['up']) {
      deltaY -= delta;
    }
    if (touchPressed.current['down']) {
      deltaY += delta;
    }

    // Apply movement if there's any input
    if (deltaX !== 0 || deltaY !== 0) {
      // Calculate target position with bounds checking
      const targetX = Math.max(0, Math.min(SCREEN_WIDTH - CHARACTER_SIZE, newX + deltaX));
      const targetY = Math.max(0, Math.min(SCREEN_HEIGHT - CHARACTER_SIZE, newY + deltaY));

      // First try the full diagonal movement
      if (!checkTreeCollision(targetX, targetY)) {
        // No collision - move to target position
        newX = targetX;
        newY = targetY;
        moved = true;
        
        // Update movement direction based on dominant movement
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          setMovementDirection(deltaX > 0 ? 'walkingRight' : 'walkingLeft');
        } else {
          setMovementDirection(deltaY > 0 ? 'walkingDown' : 'walkingUp');
        }
      } else {
        // Collision detected with diagonal movement
        // Try horizontal movement only
        if (deltaX !== 0) {
          const horizontalX = Math.max(0, Math.min(SCREEN_WIDTH - CHARACTER_SIZE, newX + deltaX));
          if (!checkTreeCollision(horizontalX, newY)) {
            newX = horizontalX;
            moved = true;
            setMovementDirection(deltaX > 0 ? 'walkingRight' : 'walkingLeft');
          }
        }
        
        // Try vertical movement only (separately, not combined with horizontal)
        if (deltaY !== 0) {
          const verticalY = Math.max(0, Math.min(SCREEN_HEIGHT - CHARACTER_SIZE, newY + deltaY));
          if (!checkTreeCollision(newX, verticalY)) {
            newY = verticalY;
            moved = true;
            setMovementDirection(deltaY > 0 ? 'walkingDown' : 'walkingUp');
          }
        }
      }
    }

    if (moved) {
      positionRef.current.x = newX;
      positionRef.current.y = newY;
      animatedX.setValue(newX);
      animatedY.setValue(newY);
      checkCollision(newX, newY);
      touchRafId.current = requestAnimationFrame(touchLoop);
    } else {
      touchLastTimeRef.current = null;
      touchRafId.current = null;
      setMovementDirection('idle');
    }
  };

  const startTouchLoopIfNeeded = () => {
    if (touchRafId.current == null) {
      touchLastTimeRef.current = null;
      touchRafId.current = requestAnimationFrame(touchLoop);
    }
  };

  const stopTouchLoop = () => {
    if (touchRafId.current != null) {
      cancelAnimationFrame(touchRafId.current);
      touchRafId.current = null;
      touchLastTimeRef.current = null;
    }
  };

  // Touch control handlers
  const handleTouchStart = (direction: string) => {
    touchPressed.current[direction] = true;
    startTouchLoopIfNeeded();
  };

  const handleTouchEnd = (direction: string) => {
    touchPressed.current[direction] = false;
    
    // Check if any touch buttons are still pressed
    const anyPressed = Object.values(touchPressed.current).some(pressed => pressed);
    if (!anyPressed) {
      stopTouchLoop();
      setMovementDirection('idle');
    }
  };

  // Single tap nudge function (for backward compatibility)
  const nudge = (dx: number, dy: number) => {
    const newX = Math.min(Math.max(0, positionRef.current.x + dx), MAP_WIDTH - CHARACTER_SIZE);
    const newY = Math.min(Math.max(0, positionRef.current.y + dy), MAP_HEIGHT - CHARACTER_SIZE);
    
    // Only move if it doesn't collide with trees and stays on floor
    if (!checkTreeCollision(newX, newY) && checkFloorBoundary(newX, newY)) {
      applyPosition(newX, newY);
    }
  };

  // Cleanup touch loop on unmount
  useEffect(() => {
    return () => {
      if (touchRafId.current != null) {
        cancelAnimationFrame(touchRafId.current);
      }
    };
  }, []);

  // Helper function to check if pumpkin position is safe (not in trees)
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
          <Image 
            source={getCurrentCostumeImage()} 
            style={[
              styles.characterImage, 
              {
                transform: [
                  { scaleX: shouldFlipCharacter() ? -getCurrentScale() : getCurrentScale() },
                  { rotate: `${getCurrentRotation()}deg` }
                ]
              }
            ]} 
            resizeMode="contain" 
          />
        </Animated.View>

        {/* Pumpkins positioned in world coordinates */}
        {pumpkins?.map?.((p) => (
          <Pumpkin key={p.id} x={p.x} y={p.y} />
        ))}
      </Animated.View>

      {showControls && (
        <View style={styles.controlsContainer} pointerEvents="box-none">
          <TouchableOpacity 
            style={styles.arrowButton} 
            onPressIn={() => handleTouchStart('left')}
            onPressOut={() => handleTouchEnd('left')}
            onPress={() => nudge(-20, 0)} // Fallback for quick taps
          >
            <Text>←</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.arrowButton} 
            onPressIn={() => handleTouchStart('right')}
            onPressOut={() => handleTouchEnd('right')}
            onPress={() => nudge(20, 0)} // Fallback for quick taps
          >
            <Text>→</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.arrowButton} 
            onPressIn={() => handleTouchStart('up')}
            onPressOut={() => handleTouchEnd('up')}
            onPress={() => nudge(0, -20)} // Fallback for quick taps
          >
            <Text>↑</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.arrowButton} 
            onPressIn={() => handleTouchStart('down')}
            onPressOut={() => handleTouchEnd('down')}
            onPress={() => nudge(0, 20)} // Fallback for quick taps
          >
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