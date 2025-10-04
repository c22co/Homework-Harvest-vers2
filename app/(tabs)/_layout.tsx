import { CurrencyProvider } from '@/components/CurrencyContext';
import { TodoProvider } from '@/components/TodoContext';
import { Slot } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <TodoProvider>
      <CurrencyProvider>
        <Slot />
      </CurrencyProvider>
    </TodoProvider>
  );
}
