// shoppingPage.tsx
import { useCurrency } from '@/components/CurrencyContext';
import React from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ShoppingPageProps {
  onClose: () => void;
  onOutfitChange?: (outfit: string) => void; // optional callback
}

const OUTFITS = [
  { id: '1', name: 'Wizard', price: 50, emoji: '🧙' },
  { id: '2', name: 'Ninja', price: 75, emoji: '🥷' },
  { id: '3', name: 'Knight', price: 100, emoji: '🛡️' },
  { id: '4', name: 'Chef', price: 40, emoji: '👨‍🍳' },
  { id: '5', name: 'Detective', price: 60, emoji: '🕵️' },
  { id: '6', name: 'Fairy', price: 80, emoji: '🧚' },
  { id: '7', name: 'Astronaut', price: 120, emoji: '👨‍🚀' },
];

export default function ShoppingPage({
  onClose,
  onOutfitChange,
}: ShoppingPageProps) {
  const {
    currency,
    setCurrency,
    add_currency,
    ownedOutfits,
    setOwnedOutfits,
    currentOutfit,
    equipOutfit,
  } = useCurrency();

  const handlePurchase = (outfit: string, price: number) => {
    if (ownedOutfits.includes(outfit)) {
      Alert.alert('Already Owned', 'You already own this outfit.');
      return;
    }
    if ((currency ?? 0) < price) {
      Alert.alert('Not Enough Coins', 'You do not have enough coins.');
      return;
    }

    if (typeof add_currency === 'function') {
      add_currency(-price);
    } else if (typeof setCurrency === 'function') {
      setCurrency((prev: number) => prev - price);
    }

    setOwnedOutfits(prev => [...prev, outfit]);
  };

  const handleEquip = (outfit: string) => {
    if (!ownedOutfits.includes(outfit)) {
      Alert.alert('Not Owned', 'You need to buy this outfit first.');
      return;
    }
    const success = equipOutfit(outfit);
    if (success && typeof onOutfitChange === 'function') onOutfitChange(outfit);
  };

  const renderOutfit = ({ item }: { item: typeof OUTFITS[0] }) => {
    const owned = ownedOutfits.includes(item.emoji);
    const equipped = currentOutfit === item.emoji;

    return (
      <View style={styles.outfitContainer}>
        <Text style={styles.outfitEmoji}>{item.emoji}</Text>
        <Text style={styles.outfitName}>{item.name}</Text>
        <Text style={styles.outfitPrice}>{item.price} coins</Text>

        {equipped ? (
          <Text style={styles.equippedText}>Equipped</Text>
        ) : owned ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#34C759' }]}
            onPress={() => handleEquip(item.emoji)}
          >
            <Text style={styles.buttonText}>Equip</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={() => handlePurchase(item.emoji, item.price)}
          >
            <Text style={styles.buttonText}>Buy</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top bar with coins + close button */}
      <View style={styles.topBar}>
        <Text style={styles.currencyText}>💰 {currency ?? 0} coins</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>

      {/* Outfit list */}
      <FlatList
        data={OUTFITS}
        renderItem={renderOutfit}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // transparent so the background image shows through
  container: { flex: 1, backgroundColor: 'transparent' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#007AFF',
  },
  currencyText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  closeButton: { padding: 8 },
  closeButtonText: { color: '#fff', fontSize: 16 },
  list: { padding: 16 },
  outfitContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  outfitEmoji: { fontSize: 40 },
  outfitName: { fontSize: 18, marginTop: 8 },
  outfitPrice: { fontSize: 14, color: '#666' },
  button: {
    marginTop: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: { color: '#fff', fontSize: 14 },
  equippedText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34C759',
  },
});