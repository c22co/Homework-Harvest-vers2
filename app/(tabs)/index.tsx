// index.tsx
import CompletedTasks from '@/components/CompletedTasks';
import { useCurrency } from '@/components/CurrencyContext';
import Pumpkin from '@/components/Pumpkin';
import SomeComponent from '@/components/SomeComponent';
import { TodoProvider } from '@/components/TodoContext';
import TodoList from '@/components/TodoList';
import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import PlayerController from '../PlayerController';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const [showCompleted, setShowCompleted] = React.useState(false);
  const [pumpkins, setPumpkins] = React.useState<{ id: string; x: number; y: number }[]>([]);
  const { currentOutfit } = useCurrency();

  // Callback to spawn a pumpkin on task completion
  const spawnPumpkin = () => {
    const id = Date.now().toString();
    const x = Math.random() * (SCREEN_WIDTH - 60);
    const y = Math.random() * (SCREEN_HEIGHT - 200);
    setPumpkins(prev => [...prev, { id, x, y }]);
  };

  return (
    <TodoProvider>
      {/* Player/character */}
      <PlayerController
        pumpkins={pumpkins}
        setPumpkins={setPumpkins}
        outfit={currentOutfit} // pass the outfit to the character
      />

      {/* Other components */}
      <SomeComponent />

      {showCompleted ? (
        <CompletedTasks onBack={() => setShowCompleted(false)} />
      ) : (
        <TodoList
          onShowCompleted={() => setShowCompleted(true)}
          onTaskCompleted={spawnPumpkin}
        />
      )}

      {/* Pumpkins rendering */}
      {pumpkins.map(pumpkin => (
        <Pumpkin key={pumpkin.id} x={pumpkin.x} y={pumpkin.y} />
      ))}
    </TodoProvider>
  );
}

const styles = StyleSheet.create({});
