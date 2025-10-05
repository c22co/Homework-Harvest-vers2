import React, { useState, useEffect, useRef } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Map constants (matching PlayerController)
const MAP_WIDTH = 2000;
const MAP_HEIGHT = 1500;
// No artificial floor boundary - rain falls through entire world naturally

interface RainDrop {
  id: string;
  x: number;
  y: number;
  speed: number;
  sprite: number;
  landingTime: number; // Time when this drop should land (in milliseconds)
}

interface FloorSplash {
  id: string;
  x: number;
  y: number;
  opacity: number;
  sprite: number;
}

export default function Rain({ 
  isRaining = false,
  intensity = 100,
  cameraX = 0,
  cameraY = 0
}: {
  isRaining?: boolean;
  intensity?: number;
  cameraX?: number;
  cameraY?: number;
}) {
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);
  const [floorSplashes, setFloorSplashes] = useState<FloorSplash[]>([]);
  const [isFading, setIsFading] = useState(false);
  const [rainOpacity, setRainOpacity] = useState(1);
  const animationFrameRef = useRef<number | null>(null);
  const dropCounterRef = useRef(0);
  const rainDropsRef = useRef<RainDrop[]>([]);
  const floorSplashesRef = useRef<FloorSplash[]>([]);
  const prevIsRainingRef = useRef(isRaining);

  // Rain drop sprites
  const dropSprites = [
    require('@/assets/images/rain/drops/0.png'),
    require('@/assets/images/rain/drops/1.png'),
    require('@/assets/images/rain/drops/2.png'),
  ];

  // Floor splash sprites
  const floorSprites = [
    require('@/assets/images/rain/floor/0.png'),
    require('@/assets/images/rain/floor/1.png'),
    require('@/assets/images/rain/floor/2.png'),
  ];

  // Keep refs in sync with state
  useEffect(() => {
    rainDropsRef.current = rainDrops;
  }, [rainDrops]);

  useEffect(() => {
    floorSplashesRef.current = floorSplashes;
  }, [floorSplashes]);

  // Handle fade-out when rain stops
  useEffect(() => {
    // If rain was on and now it's off, start fading
    if (prevIsRainingRef.current && !isRaining && !isFading) {
      setIsFading(true);
    }
    // If rain starts again, reset fade state
    else if (!prevIsRainingRef.current && isRaining) {
      setIsFading(false);
      setRainOpacity(1);
    }
    prevIsRainingRef.current = isRaining;
  }, [isRaining, isFading]);

  // Create a new rain drop - spread across current view area
  const createRainDrop = (): RainDrop => {
    // Calculate current camera view bounds in world coordinates
    const worldViewLeft = -cameraX - 100; // Start slightly left of view
    const worldViewRight = -cameraX + SCREEN_WIDTH + 100; // End slightly right of view
    const worldViewTop = -cameraY - 300; // Start well above current view
    
    // Random landing time between 1-5 seconds from now
    const landingDelay = 1000 + Math.random() * 2000; // 1000ms to 5000ms
    
    return {
      id: `drop_${dropCounterRef.current++}`,
      x: worldViewLeft + Math.random() * (worldViewRight - worldViewLeft), // Rain across extended view width
      y: worldViewTop, // Start above current camera view
      speed: 3 + Math.random() * 4, // Speed between 3-7
      sprite: Math.floor(Math.random() * 3), // Random sprite (0, 1, or 2)
      landingTime: Date.now() + landingDelay, // When this drop should land
    };
  };

  // Create a floor splash - positioned where rain hits the ground
  const createFloorSplash = (x: number, y: number): FloorSplash => {
    return {
      id: `splash_${Date.now()}_${Math.random()}`,
      x: x,
      y: y + Math.random() * 10, // Position where the drop hit with slight variation
      opacity: 1,
      sprite: Math.floor(Math.random() * 3), // Random sprite (0, 1, or 2)
    };
  };

  // Animate rain drops falling
  useEffect(() => {
    if (!isRaining && !isFading) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setRainDrops([]);
      setFloorSplashes([]);
      setRainOpacity(1);
      return;
    }

    const animate = () => {
      const currentDrops = [...rainDropsRef.current];
      const currentSplashes = [...floorSplashesRef.current];
      
      // Handle fading
      if (isFading) {
        setRainOpacity(prev => {
          const newOpacity = Math.max(0, prev - 0.02); // Fade speed
          if (newOpacity <= 0) {
            setIsFading(false);
            setRainDrops([]);
            setFloorSplashes([]);
            return 1;
          }
          return newOpacity;
        });
        // Don't add new drops while fading
      } else {
        // Add new drops based on intensity (only if actively raining)
        if (isRaining && Math.random() < intensity / 100 && currentDrops.length < intensity) {
          currentDrops.push(createRainDrop());
        }
      }

      // Update existing drops
      const updatedDrops: RainDrop[] = [];
      const newSplashes: FloorSplash[] = [];
      
      currentDrops.forEach(drop => {
        // Move diagonally: down and to the left
        drop.y += drop.speed; // Downward movement
        drop.x -= drop.speed * 0.5; // Leftward movement (half the vertical speed for realistic angle)
        
        // Check if drop has reached its landing time
        const currentTime = Date.now();
        if (currentTime >= drop.landingTime) {
          // Drop has "landed" after its random time, create splash at current position
          newSplashes.push(createFloorSplash(drop.x, drop.y));
          // Remove the drop after it lands
        } else {
          // Keep drop if it hasn't reached its landing time yet
          updatedDrops.push(drop);
        }
      });

      // Update splashes - fade them out over time
      const updatedSplashes = [...currentSplashes, ...newSplashes]
        .map(splash => ({
          ...splash,
          opacity: Math.max(0, splash.opacity - 0.02)
        }))
        .filter(splash => splash.opacity > 0);

      // Update state
      setRainDrops(updatedDrops);
      setFloorSplashes(updatedSplashes);

      if (isRaining || isFading) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRaining, isFading, intensity]);

  if (!isRaining && !isFading) return null;

  return (
    <View style={[styles.container, { opacity: rainOpacity }]} pointerEvents="none">
      {/* Rain Drops */}
      {rainDrops.map(drop => {
        // Convert world coordinates to screen coordinates
        const screenX = drop.x + cameraX;
        const screenY = drop.y + cameraY;
        
        // Only render if visible on screen (with margin for smooth transitions)
        if (screenX > -50 && screenX < SCREEN_WIDTH + 50 && 
            screenY > -50 && screenY < SCREEN_HEIGHT + 50) {
          return (
            <View
              key={drop.id}
              style={[
                styles.rainDrop,
                {
                  left: screenX,
                  top: screenY,
                },
              ]}
            >
              <Image source={dropSprites[drop.sprite]} style={styles.dropImage} />
            </View>
          );
        }
        return null;
      })}

      {/* Floor Splashes */}
      {floorSplashes.map(splash => {
        // Convert world coordinates to screen coordinates
        const screenX = splash.x + cameraX;
        const screenY = splash.y + cameraY;
        
        // Only render if visible on screen (with margin for smooth transitions)
        if (screenX > -50 && screenX < SCREEN_WIDTH + 50 && 
            screenY > -50 && screenY < SCREEN_HEIGHT + 50) {
          return (
            <View
              key={splash.id}
              style={[
                styles.floorSplash,
                {
                  left: screenX,
                  top: screenY,
                  opacity: splash.opacity,
                },
              ]}
            >
              <Image source={floorSprites[splash.sprite]} style={styles.splashImage} />
            </View>
          );
        }
        return null;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 0, // Behind trees (zIndex: 1) but above background elements
  },
  rainDrop: {
    position: 'absolute',
    width: 8,
    height: 16,
  },
  dropImage: {
    width: 8,
    height: 16,
    resizeMode: 'contain',
  },
  floorSplash: {
    position: 'absolute',
    width: 16,
    height: 16,
  },
  splashImage: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
});