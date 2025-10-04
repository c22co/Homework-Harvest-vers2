import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useCurrency } from './CurrencyContext';

export default function CurrencyDisplay() {
  const { currency } = useCurrency();
  const [open, setOpen] = useState(false);

  // on web hover opens dropdown; on native press toggles
  const handleToggle = () => {
    if (Platform.OS === 'web') return;
    setOpen(v => !v);
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <Pressable
        onPress={handleToggle}
        onHoverIn={() => Platform.OS === 'web' && setOpen(true)}
        onHoverOut={() => Platform.OS === 'web' && setOpen(false)}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Image source={require('@/assets/images/Coin.png')} style={styles.icon} />
        <Text style={styles.symbol}>$</Text>
      </Pressable>

      {open && (
        <View style={styles.dropdown}>
          <Text style={styles.dropdownLabel}>Balance</Text>
          <Text style={styles.amount}>${currency}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 50,
    alignItems: 'flex-end',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  icon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  symbol: {
    fontWeight: '700',
    color: '#111',
  },
  dropdown: {
    marginTop: 8,
    minWidth: 140,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  dropdownLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  amount: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
});