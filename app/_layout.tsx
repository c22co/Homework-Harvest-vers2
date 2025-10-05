import { CurrencyProvider } from '@/components/CurrencyContext';
import { TodoProvider } from '@/components/TodoContext';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <TodoProvider>
      <CurrencyProvider>
        <Slot />
      </CurrencyProvider>
    </TodoProvider>
  );
}