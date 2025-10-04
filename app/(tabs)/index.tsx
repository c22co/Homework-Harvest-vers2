import PlayerController from '@/app/PlayerController';
import { CompletedTasks } from '@/components/CompletedTasks';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import TaskTimer from '@/components/TaskTimer';
import { TodoProvider } from '@/components/TodoContext';
import TodoList from '@/components/TodoList';
import React, { useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const bg = require('../../assets/images/background.png');
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type PumpkinItem = { id: string; x: number; y: number };

export default function HomeScreen() {
  const [showCompleted, setShowCompleted] = useState(false);
  const [pumpkins, setPumpkins] = useState<PumpkinItem[]>([]);
  const [uiVisible, setUiVisible] = useState(true);

  // detect touch device for mobile controls
  const isTouchDevice =
    Platform.OS !== 'web' ||
    (typeof navigator !== 'undefined' && (navigator.maxTouchPoints ?? 0) > 0);

  // playerRef holds the player's world position
  const playerRef = React.useRef<{ x: number; y: number; nudge: (dx: number, dy: number) => void } | null>(null);

  // Callback to spawn a pumpkin
  const spawnPumpkin = () => {
    const id = Date.now().toString();
    const px = playerRef.current?.x ?? SCREEN_WIDTH / 2;
    const py = playerRef.current?.y ?? SCREEN_HEIGHT / 2;
    const offset = 120 + Math.random() * 200;
    const angle = Math.random() * Math.PI * 2;
    const x = px + Math.cos(angle) * offset;
    const y = py + Math.sin(angle) * offset;
    setPumpkins(prev => [...prev, { id, x, y }]);
  };

  return (
    <ImageBackground
      source={bg}
      style={styles.background}
      resizeMode={Platform.OS === 'web' ? 'repeat' : 'cover'}
      imageStyle={Platform.OS === 'web' ? { resizeMode: 'repeat' } : undefined}
    >
      <TodoProvider>
        <View style={styles.container}>
          <PlayerController
            pumpkins={pumpkins}
            setPumpkins={setPumpkins}
            playerRef={playerRef}
            showControls={isTouchDevice}
          />

          {/* UI Toggle Button - Top Center */}
          <TouchableOpacity 
            style={styles.uiToggle}
            onPress={() => setUiVisible(!uiVisible)}
          >
            <Text style={styles.uiToggleText}>{uiVisible ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>

          {/* UI Components - Positioned individually */}
          {uiVisible && (
            <>
              {/* Todo List - Top Left */}
              <View style={styles.todoListContainer}>
                <TodoList onShowCompleted={() => setShowCompleted(true)} onTaskCompleted={spawnPumpkin} />
                {showCompleted && <CompletedTasks onBack={() => setShowCompleted(false)} />}
              </View>

              {/* Currency Display - Top Right */}
              <View style={styles.currencyContainer}>
                <CurrencyDisplay />
              </View>

              {/* Task Timer - Bottom Right */}
              <View style={styles.timerContainer}>
                <TaskTimer />
              </View>
            </>
          )}
        </View>
      </TodoProvider>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1, backgroundColor: 'transparent' },
  uiToggle: {
    position: 'absolute',
    top: 20,
    left: '50%',
    marginLeft: -25,
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
  todoListContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 100,
  },
  currencyContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 100,
  },
  timerContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 100,
  },
});
