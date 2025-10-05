import { Tabs } from 'expo-router';
import React from 'react';

import { CurrencyProvider } from '@/components/CurrencyContext';
import { TodoProvider } from '@/components/TodoContext';
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
            // Hide bottom nav bar; we'll use a top button instead
            tabBarStyle: { display: 'none' },
            tabBarShowLabel: false,
            tabBarButton: () => null,
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
