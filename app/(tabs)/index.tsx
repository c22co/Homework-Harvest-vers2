import React from 'react';
import { Dimensions, StyleSheet, View, TouchableOpacity, Text, Animated } from 'react-native';
import PlayerController from '@/app/PlayerController';
import TodoList from '@/components/TodoList';
import CompletedTasks from '@/components/CompletedTasks';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { CurrencyProvider } from '@/components/CurrencyContext';
import { TodoProvider } from '@/components/TodoContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const [showCompleted, setShowCompleted] = React.useState(false);
  const [pumpkins, setPumpkins] = React.useState<{ id: string; x: number; y: number }[]>([]);
  const [uiVisible, setUiVisible] = React.useState(true);

  // animated opacity for UI
  const uiOpacity = React.useRef(new Animated.Value(uiVisible ? 1 : 0)).current;
  React.useEffect(() => {
    Animated.timing(uiOpacity, {
      toValue: uiVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [uiVisible, uiOpacity]);

  // playerRef holds the player's world position so other code (spawnPumpkin) can place world objects
  const playerRef = React.useRef<{ x: number; y: number } | null>(null);

  // Callback to spawn a pumpkin in world coordinates near the player
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
    <CurrencyProvider>
      <TodoProvider>
        <View style={styles.container}>
          <PlayerController
            pumpkins={pumpkins}
            setPumpkins={setPumpkins}
            playerRef={playerRef}
            showControls={uiVisible}
          />

          {/* animated UI overlay: opacity + pointerEvents */}
          <Animated.View
            style={[styles.uiOverlay, { opacity: uiOpacity }]}
            pointerEvents={uiVisible ? 'auto' : 'none'}
          >
            <TodoList onShowCompleted={() => setShowCompleted(true)} onTaskCompleted={spawnPumpkin} />
            {showCompleted ? <CompletedTasks onBack={() => setShowCompleted(false)} /> : null}
            <CurrencyDisplay />
          </Animated.View>

          {/* Toggle UI button (top-center) */}
          <View pointerEvents="box-none" style={styles.topCenter}>
            <TouchableOpacity
              onPress={() => setUiVisible(v => !v)}
              style={[styles.toggleButton, uiVisible ? styles.toggleOn : styles.toggleOff]}
            >
              <Text style={styles.toggleText}>{uiVisible ? 'Hide UI' : 'Show UI'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TodoProvider>
    </CurrencyProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topCenter: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  toggleOn: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(0,0,0,0.08)',
  },
  toggleOff: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  toggleText: {
    fontWeight: '700',
    color: '#111',
  },
  uiOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 50,
  },
});
