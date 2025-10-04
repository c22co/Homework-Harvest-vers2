import { Tabs } from 'expo-router';
import React from 'react';

import { CurrencyProvider } from '@/components/CurrencyContext';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
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
          name="explore" // match the file app/(tabs)/explore.tsx
          options={{
            title: 'Shop', // display "Shop" in the tab bar
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="cart" color={color} />,
          }}
        />
      </Tabs>
    </CurrencyProvider>
  );
}
