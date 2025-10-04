import PlayerController from '@/app/PlayerController';
import CompletedTasks from '@/components/CompletedTasks';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import TodoList from '@/components/TodoList';
import React from 'react';
import { Animated, Dimensions, ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// remove the extra provider here (top-level provider is in _layout.tsx)
// import { CurrencyProvider } from '@/components/CurrencyContext';
import { TodoProvider } from '@/components/TodoContext';

// require the asset relative to this file
const bg = require('../../assets/images/background.png');

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

  // player world position
  const playerRef = React.useRef<{ x: number; y: number } | null>(null);

  // show on-screen arrows only on mobile / touch devices
  const isTouchDevice =
    Platform.OS !== 'web' ||
    (typeof navigator !== 'undefined' && (navigator.maxTouchPoints ?? 0) > 0);

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
    // tile the image on web so pixel-art repeats instead of scaling up;
    // keep cover on native devices.
    <ImageBackground
      source={bg}
      style={styles.background}
      resizeMode={Platform.OS === 'web' ? 'repeat' : 'cover'}
      // react-native-web supports imageStyle resizeMode: 'repeat'
      imageStyle={Platform.OS === 'web' ? { resizeMode: 'repeat' } : undefined}
    >
      <TodoProvider>
        <View style={styles.container}>
          <PlayerController
            pumpkins={pumpkins}
            setPumpkins={setPumpkins}
            playerRef={playerRef}
            // show on-screen arrows only on touch devices (mobile). laptop/web = no arrows.
            showControls={isTouchDevice}
          />

          {/* overlay no longer blocks pointer events globally.
              Put interactive UI inside a child view (uiContent) that accepts events. */}
          <Animated.View
            style={[styles.uiOverlay, { opacity: uiOpacity }]}
            // allow pointer events through to controls underneath, but children can still be interactive
            pointerEvents={uiVisible ? 'box-none' : 'none'}
          >
            <View pointerEvents={uiVisible ? 'auto' : 'none'} style={styles.uiContent}>
              <TodoList onShowCompleted={() => setShowCompleted(true)} onTaskCompleted={spawnPumpkin} />
              {showCompleted ? <CompletedTasks onBack={() => setShowCompleted(false)} /> : null}
              <CurrencyDisplay />
            </View>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // background image sizing
  background: { flex: 1, width: '100%', height: '100%' },
  // keep the container transparent so background shows through
  container: { flex: 1, backgroundColor: 'transparent' },

  // overlay + interactive child
  uiOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 50,
  },
  uiContent: {
    flex: 1,
    // keep interactive UI above background but allow controls (higher z) to be clickable
    zIndex: 60,
    // don't set an opaque background here unless you want it to cover the image
    backgroundColor: 'transparent',
  },

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
});
