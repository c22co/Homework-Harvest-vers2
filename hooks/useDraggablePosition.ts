import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Position {
  x: number;
  y: number;
}

const STORAGE_KEYS = {
  TODO_POSITION: 'todoList_position',
  TIMER_POSITION: 'taskTimer_position',
};

export function useDraggablePosition(
  key: keyof typeof STORAGE_KEYS,
  defaultPosition: Position
) {
  const [position, setPosition] = useState<Position>(defaultPosition);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved position on mount
  useEffect(() => {
    const loadPosition = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS[key]);
        if (saved) {
          const parsedPosition = JSON.parse(saved);
          setPosition(parsedPosition);
        }
      } catch (error) {
        console.warn('Failed to load saved position:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadPosition();
  }, [key]);

  // Save position when it changes
  const updatePosition = async (newPosition: Position) => {
    setPosition(newPosition);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS[key], JSON.stringify(newPosition));
    } catch (error) {
      console.warn('Failed to save position:', error);
    }
  };

  return {
    position,
    updatePosition,
    isLoaded,
  };
}