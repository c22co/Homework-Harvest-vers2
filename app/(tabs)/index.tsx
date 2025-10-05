import PlayerController from '@/app/PlayerController';
import { CompletedTasks } from '@/components/CompletedTasks';
import { useCurrency } from '@/components/CurrencyContext';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import Rain from '@/components/Rain';
import TaskTimer from '@/components/TaskTimer';
import { TodoProvider } from '@/components/TodoContext';
import TodoList from '@/components/TodoList';
import AudioControl from '@/components/AudioControl';
import DraggableContainer from '@/components/DraggableContainer';
import { useDraggablePosition } from '@/hooks/useDraggablePosition';
import React, { useState } from 'react';
import { router } from 'expo-router';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type PumpkinItem = { id: string; x: number; y: number };

export default function HomeScreen() {
  const [showCompleted, setShowCompleted] = useState(false);
  const [pumpkins, setPumpkins] = useState<PumpkinItem[]>([]);
  const [uiVisible, setUiVisible] = useState(true);
  const [isRaining, setIsRaining] = useState(false);
  const { getPumpkinMultiplier } = useCurrency();

  // Draggable position hooks for mobile
  const todoPosition = useDraggablePosition('TODO_POSITION', { x: 20, y: 20 });
  const timerPosition = useDraggablePosition('TIMER_POSITION', { x: SCREEN_WIDTH - 270, y: SCREEN_HEIGHT - 270 });

  // detect touch device for mobile controls
  const isTouchDevice =
    Platform.OS !== 'web' ||
    (typeof navigator !== 'undefined' && (navigator.maxTouchPoints ?? 0) > 0);

  // playerRef holds the player's world position and collision functions
  const playerRef = React.useRef<{ 
    x: number; 
    y: number; 
    nudge: (dx: number, dy: number) => void;
    isPumpkinPositionSafe?: (x: number, y: number) => boolean;
    cameraX: number;
    cameraY: number;
    reviveAllTrees?: () => void;
  } | null>(null);

  // Callback to spawn pumpkin(s) in world coordinates near the player (avoiding trees)
  // Number of pumpkins spawned depends on owned pumpkin seeds
  // Weather changes: stops rain if raining, or 20% chance to start rain if clear
  const spawnPumpkin = () => {
    const multiplier = getPumpkinMultiplier();
    const px = playerRef.current?.x ?? SCREEN_WIDTH / 2;
    const py = playerRef.current?.y ?? SCREEN_HEIGHT / 2;
    
    // Weather logic: if raining, stop it; if clear, 20% chance to start rain
    if (isRaining) {
      setIsRaining(false); // Stop rain if it's currently raining
    } else if (Math.random() < 0.2) {
      setIsRaining(true); // 20% chance to start rain if clear
      // When rain starts, revive all dead trees and return sprites to alive
      const revive = playerRef.current?.reviveAllTrees;
      if (revive) revive();
    }
    
    // Spawn multiple pumpkins based on multiplier
    for (let i = 0; i < multiplier; i++) {
      const id = `${Date.now()}-${i}`;
      let attempts = 0;
      const maxAttempts = 50;
      
      while (attempts < maxAttempts) {
        const offset = 120 + Math.random() * 200;
        const angle = Math.random() * Math.PI * 2;
        const x = px + Math.cos(angle) * offset;
        const y = py + Math.sin(angle) * offset;
        
        // Check if position is within screen bounds
        if (x >= 0 && x <= SCREEN_WIDTH - 40 && y >= 0 && y <= SCREEN_HEIGHT - 40) {
          // Check if position is safe (not in trees)
          if (playerRef.current?.isPumpkinPositionSafe?.(x, y)) {
            setPumpkins(prev => [...prev, { id, x, y }]);
            break; // Successfully spawned this pumpkin, move to next
          }
        }
        attempts++;
      }
      
      // Fallback: spawn at a safe distance from player if no safe position found
      if (attempts >= maxAttempts) {
        const fallbackX = Math.max(40, Math.min(SCREEN_WIDTH - 80, px + (i * 60) + 100));
        const fallbackY = Math.max(40, Math.min(SCREEN_HEIGHT - 80, py + (i * 60) + 100));
        setPumpkins(prev => [...prev, { id, x: fallbackX, y: fallbackY }]);
      }
    }
  };

  return (
    <TodoProvider>
      <View style={styles.container}>
        <PlayerController
          pumpkins={pumpkins}
          setPumpkins={setPumpkins}
          playerRef={playerRef}
          showControls={isTouchDevice}
          isRaining={isRaining}
        />

        {/* UI Toggle Button - Top Center */}
        <TouchableOpacity 
          style={styles.uiToggle}
          onPress={() => setUiVisible(!uiVisible)}
        >
          <Text style={styles.uiToggleText}>{uiVisible ? '👁️' : '👁️‍🗨️'}</Text>
        </TouchableOpacity>

        {/* Shop Button - Top Center cluster */}
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.replace('/(tabs)/explore')}
        >
          <Text style={styles.uiToggleText}>🛒</Text>
        </TouchableOpacity>

        {/* Rain Animation */}
        <Rain 
          isRaining={isRaining} 
          intensity={30} 
          cameraX={playerRef.current?.cameraX || 0}
          cameraY={playerRef.current?.cameraY || 0}
        />
        {/* Audio Control Button - Top Center Right */}
        <AudioControl />

        {/* UI Components - Positioned individually */}
        {uiVisible && (
          <>
            {/* Todo List - Draggable on mobile, fixed on web */}
            <DraggableContainer
              initialX={todoPosition.position.x}
              initialY={todoPosition.position.y}
              onPositionChange={(x, y) => todoPosition.updatePosition({ x, y })}
              disabled={!isTouchDevice || !todoPosition.isLoaded}
            >
              <TodoList onShowCompleted={() => setShowCompleted(true)} onTaskCompleted={spawnPumpkin} />
              {showCompleted && <CompletedTasks onBack={() => setShowCompleted(false)} />}
            </DraggableContainer>

            {/* Currency Display - Fixed position (not draggable for now) */}
            <View style={styles.currencyContainer}>
              <CurrencyDisplay />
            </View>

            {/* Task Timer - Draggable on mobile, fixed on web */}
            <DraggableContainer
              initialX={timerPosition.position.x}
              initialY={timerPosition.position.y}
              onPositionChange={(x, y) => timerPosition.updatePosition({ x, y })}
              disabled={!isTouchDevice || !timerPosition.isLoaded}
            >
              <TaskTimer />
            </DraggableContainer>
          </>
        )}
      </View>
    </TodoProvider>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1, backgroundColor: 'transparent' },
  uiToggle: {
    position: 'absolute',
    top: 20,
    left: '50%',
    marginLeft: -75,
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  uiToggleText: {
    fontSize: 24,
  },
  shopButton: {
    position: 'absolute',
    top: 20,
    left: '50%',
    marginLeft: 25, // positioned to the right of audio; cluster centered
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  currencyContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 100,
  },
});
