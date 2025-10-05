import { CurrencyProvider } from '@/components/CurrencyContext';
import { TodoProvider } from '@/components/TodoContext';
import { AudioProvider } from '@/components/AudioManager';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TodoProvider>
        <CurrencyProvider>
          <AudioProvider>
            <Slot />
          </AudioProvider>
        </CurrencyProvider>
      </TodoProvider>
    </GestureHandlerRootView>
  );
}