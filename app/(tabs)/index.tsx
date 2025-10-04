import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Dimensions } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { CurrencyProvider } from '@/components/CurrencyContext';
import PlayerController from '../PlayerController';
import SomeComponent from '@/components/SomeComponent';
import { TodoProvider } from '@/components/TodoContext';
import TodoList from '@/components/TodoList';
import CompletedTasks from '@/components/CompletedTasks';
import Pumpkin from '@/components/Pumpkin';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const [showCompleted, setShowCompleted] = React.useState(false);
  const [pumpkins, setPumpkins] = React.useState<
    { id: string; x: number; y: number }[]
  >([]);

  // Callback to spawn a pumpkin
  const spawnPumpkin = () => {
    const id = Date.now().toString();
    // Random position within screen bounds
    const x = Math.random() * (SCREEN_WIDTH - 60);
    const y = Math.random() * (SCREEN_HEIGHT - 200);
    setPumpkins(prev => [...prev, { id, x, y }]);
  };

  return (
    <CurrencyProvider>
      <TodoProvider>
        <PlayerController
          pumpkins={pumpkins}
          setPumpkins={setPumpkins}
        />
        <SomeComponent />
        {showCompleted ? (
          <CompletedTasks onBack={() => setShowCompleted(false)} />
        ) : (
          <TodoList
            onShowCompleted={() => setShowCompleted(true)}
            onTaskCompleted={spawnPumpkin}
          />
        )}
        {pumpkins.map(pumpkin => (
          <Pumpkin key={pumpkin.id} x={pumpkin.x} y={pumpkin.y} />
        ))}
      </TodoProvider>
    </CurrencyProvider>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
