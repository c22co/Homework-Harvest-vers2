import { Tabs } from 'expo-router';
import React from 'react';
<<<<<<< HEAD
import { Slot } from 'expo-router';

=======
import { StyleSheet, View } from 'react-native';
>>>>>>> d6148dfbb96726ad15d094a034be3f888c6e4ec3

import { CurrencyProvider } from '@/components/CurrencyContext';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <CurrencyProvider>
      <View style={styles.container}>
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
      </View>
    </CurrencyProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
