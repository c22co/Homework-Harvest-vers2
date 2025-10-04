import { Tabs } from 'expo-router';
import React from 'react';

import { CurrencyProvider } from '@/components/CurrencyContext';
import { TodoProvider } from '@/components/TodoContext';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <TodoProvider>
      <CurrencyProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            headerShown: false,
            tabBarButton: HapticTab,
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="explore"
            options={{
              title: 'Shop',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="cart" color={color} />,
            }}
          />
        </Tabs>
      </CurrencyProvider>
    </TodoProvider>
  );
}
