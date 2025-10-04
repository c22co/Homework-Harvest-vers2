import React from 'react';
import { Dimensions, ImageBackground, StyleSheet, View } from 'react-native';
// CurrencyProvider is provided at the tab layout (app/(tabs)/_layout.tsx)
import PlayerController from '@/app/PlayerController';
import CompletedTasks from '@/components/CompletedTasks';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { TodoProvider } from '@/components/TodoContext';
import TodoList from '@/components/TodoList';

// require the asset relative to this file
const bg = require('../../assets/images/background.png');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const [showCompleted, setShowCompleted] = React.useState(false);
  const [pumpkins, setPumpkins] = React.useState<{ id: string; x: number; y: number }[]>([]);

  // Callback to spawn a pumpkin on task completion (uses world coords inside PlayerController)
  const spawnPumpkin = () => {
    const id = Date.now().toString();
    const x = Math.random() * (SCREEN_WIDTH - 60);
    const y = Math.random() * (SCREEN_HEIGHT - 200);
    setPumpkins(prev => [...prev, { id, x, y }]);
  };

  return (
    <ImageBackground source={bg} style={styles.background} resizeMode="cover">
      <TodoProvider>
        <View style={styles.overlay}>
          <PlayerController pumpkins={pumpkins} setPumpkins={setPumpkins} />
          <TodoList onShowCompleted={() => setShowCompleted(true)} onTaskCompleted={spawnPumpkin} />
          {showCompleted ? <CompletedTasks onBack={() => setShowCompleted(false)} /> : null}
          <CurrencyDisplay />
        </View>
      </TodoProvider>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'transparent' },
});
