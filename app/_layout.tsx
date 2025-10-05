import { AudioProvider } from '@/components/AudioManager';
import { CurrencyProvider } from '@/components/CurrencyContext';
import { TodoProvider } from '@/components/TodoContext';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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