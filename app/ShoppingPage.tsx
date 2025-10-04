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

// Updated outfit IDs to match PlayerController costumeImages
const OUTFITS = [
  { id: 'wizard', name: 'Wizard', price: 70, emoji: '🧙' },
  { id: 'cat', name: 'Cat', price: 100, emoji: '🥷' },
  { id: 'alien', name: 'Alien', price: 50, emoji: '🛡️' },
];

export default function ShoppingPage({
  onClose,
  onOutfitChange,
}: ShoppingPageProps) {
  const {
    currency,
    add_currency,
    ownedOutfits,
    setOwnedOutfits,
    currentOutfit,
    equipOutfit,
  } = useCurrency();

  const handlePurchase = (outfitId: string, price: number) => {
    if (ownedOutfits.includes(outfitId)) {
      Alert.alert('Already Owned', 'You already own this outfit.');
      return;
    }
    if ((currency ?? 0) < price) {
      Alert.alert('Not Enough Coins', 'You do not have enough coins.');
      return;
    }

    add_currency(-price);
    setOwnedOutfits(prev => [...prev, outfitId]);
  };

  const handleEquip = (outfitId: string) => {
    if (!ownedOutfits.includes(outfitId)) {
      Alert.alert('Not Owned', 'You need to buy this outfit first.');
      return;
    }
    const success = equipOutfit(outfitId);
    if (success && typeof onOutfitChange === 'function') onOutfitChange(outfitId);
  };

  const renderOutfit = ({ item }: { item: typeof OUTFITS[0] }) => {
    const owned = ownedOutfits.includes(item.id);
    const equipped = currentOutfit === item.id;

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
            onPress={() => handleEquip(item.id)}
          >
            <Text style={styles.buttonText}>Equip</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={() => handlePurchase(item.id, item.price)}
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
