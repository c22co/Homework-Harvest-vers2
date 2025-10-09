// shoppingPage.tsx
import { useCurrency } from '@/components/CurrencyContext';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAudio } from '@/components/AudioManager';

interface ShoppingPageProps {
  onClose: () => void;
  onOutfitChange?: (outfit: string) => void; // optional callback
}

// Updated outfit IDs to match PlayerController costumeImages
const OUTFITS = [
  { id: 'alien', name: 'Alien', price: 1200, image: require('@/assets/images/Alien Costume 2.png') },
  { id: 'wizard', name: 'Wizard', price: 2500, image: require('@/assets/images/Wizard Costume 2.png') },
  { id: 'cat', name: 'Cat', price: 5000, image: require('@/assets/images/Cat Costume 2.png') },
];

// Seeds inventory
const SEEDS = [
  { id: 'pumpkin', name: 'Pumpkin Seeds', price: 600, image: require('@/assets/images/Pumpkin Seeds.png'), description: 'Doubles pumpkins from completed tasks!' },
  { id: 'pepper', name: 'Pepper Seeds', price: 800, image: require('@/assets/images/Pepper Seeds.png'), description: 'Makes you bigger for 2 tasks!' },
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
    ownedSeeds,
    setOwnedSeeds,
    useSeed,
    activePumpkinBoost,
    pepperEffect,
  } = useCurrency();

  const { playPurchaseSound } = useAudio();

  const [loadingItems, setLoadingItems] = useState<{[key: string]: boolean}>({});
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  const handlePurchase = (outfitId: string, price: number) => {
    if (ownedOutfits.includes(outfitId)) {
      Alert.alert('Already Owned', 'You already own this outfit.');
      return;
    }
    if ((currency ?? 0) < price) {
      Alert.alert('Not Enough Coins', 'You do not have enough coins.');
      return;
    }

    setLoadingItems(prev => ({...prev, [outfitId]: true}));
    
    // Simulate purchase delay for better UX
    setTimeout(() => {
      add_currency(-price);
      // Play purchase sound
      try { playPurchaseSound(); } catch (e) { /* ignore */ }
      setOwnedOutfits(prev => [...prev, outfitId]);
      setLoadingItems(prev => ({...prev, [outfitId]: false}));
      setPurchaseSuccess(outfitId);
      setTimeout(() => setPurchaseSuccess(null), 2000);
      Alert.alert('Purchase Successful!', `You bought the ${outfitId} costume!`);
    }, 500);
  };

  const handleEquip = (outfitId: string) => {
    if (!ownedOutfits.includes(outfitId)) {
      Alert.alert('Not Owned', 'You need to buy this outfit first.');
      return;
    }
    const success = equipOutfit(outfitId);
    if (success && typeof onOutfitChange === 'function') onOutfitChange(outfitId);
  };

  const handleUnequip = () => {
    if (currentOutfit === 'default') {
      Alert.alert('Already Default', 'You are already wearing the default outfit.');
      return;
    }
    const success = equipOutfit('default');
    if (success && typeof onOutfitChange === 'function') onOutfitChange('default');
  };

  const handleSeedPurchase = (seedId: string, price: number) => {
    if ((currency ?? 0) < price) {
      Alert.alert('Not Enough Coins', 'You do not have enough coins.');
      return;
    }

    setLoadingItems(prev => ({...prev, [seedId]: true}));
    
    // Simulate purchase delay for better UX
    setTimeout(() => {
      add_currency(-price);
      // Play purchase sound
      try { playPurchaseSound(); } catch (e) { /* ignore */ }
      setOwnedSeeds(prev => ({ ...prev, [seedId]: (prev[seedId] || 0) + 1 }));
      setLoadingItems(prev => ({...prev, [seedId]: false}));
      setPurchaseSuccess(seedId);
      setTimeout(() => setPurchaseSuccess(null), 2000);
      Alert.alert('Purchase Successful!', `You bought ${seedId} seeds!`);
    }, 500);
  };

  const renderOutfit = ({ item }: { item: typeof OUTFITS[0] }) => {
    const owned = ownedOutfits.includes(item.id);
    const equipped = currentOutfit === item.id;
    const isLoading = loadingItems[item.id];
    const showSuccess = purchaseSuccess === item.id;

    return (
      <Pressable style={({ pressed }) => [
        styles.itemContainer,
        pressed && styles.itemPressed,
        showSuccess && styles.successGlow
      ]}>
        <View style={styles.itemContent}>
          <View style={styles.itemImageContainer}>
            <Image source={item.image} style={styles.costumeImage} />
            {equipped && <View style={styles.equippedBadge}>
              <Text style={styles.equippedBadgeText}>✓</Text>
            </View>}
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>
              <Image source={require('@/assets/images/Coin.png')} style={styles.coinImage} />{item.price}
            </Text>
            {owned && !equipped && <Text style={styles.ownedText}>✓ Owned</Text>}
            {equipped && <Text style={styles.equippedText}>Currently Equipped</Text>}
          </View>
          <View style={styles.buttonContainer}>
            {equipped ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.unequipButton]}
                onPress={handleUnequip}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Unequip</Text>
              </TouchableOpacity>
            ) : owned ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.equipButton]}
                onPress={() => handleEquip(item.id)}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Equip</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  (currency < item.price) && styles.disabledButton
                ]}
                onPress={() => handlePurchase(item.id, item.price)}
                disabled={isLoading || currency < item.price}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Buy</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  const renderSeed = ({ item }: { item: typeof SEEDS[0] }) => {
    const owned = ownedSeeds[item.id] || 0;
    const canUse = owned > 0;
    const isLoading = loadingItems[item.id];
    const showSuccess = purchaseSuccess === item.id;
    
    // Check if effect is already active
    const effectActive = item.id === 'pumpkin' ? activePumpkinBoost : 
                        item.id === 'pepper' ? pepperEffect.active : false;

    return (
      <Pressable style={({ pressed }) => [
        styles.itemContainer,
        pressed && styles.itemPressed,
        showSuccess && styles.successGlow
      ]}>
        <View style={styles.itemContent}>
          <View style={styles.itemImageContainer}>
            <View style={styles.seedIconContainer}>
              <Image source={item.image} style={styles.seedImage} />
              {effectActive && <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>!</Text>
              </View>}
            </View>
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>
              <Image source={require('@/assets/images/Coin.png')} style={styles.coinImage} />{item.price}
            </Text>
            <Text style={styles.seedDescription}>{item.description}</Text>
            {owned > 0 && (
              <Text style={styles.ownedText}>
                Owned: {owned}
              </Text>
            )}
            {effectActive && (
              <Text style={styles.activeEffectText}>
                {item.id === 'pumpkin' ? 'Effect Active!' : 
                 `Effect Active! (${pepperEffect.tasksRemaining} tasks left)`}
              </Text>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                (currency < item.price) && styles.disabledButton
              ]}
              onPress={() => handleSeedPurchase(item.id, item.price)}
              disabled={isLoading || currency < item.price}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Buy</Text>
              )}
            </TouchableOpacity>
            {canUse && !effectActive && (
              <TouchableOpacity
                style={[styles.actionButton, styles.useButton]}
                onPress={() => useSeed(item.id)}
              >
                <Text style={styles.buttonText}>
                  {item.id === 'pumpkin' ? 'Use' : 'Eat'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Enhanced header with gradient background */}
      <View style={styles.topBar}>
        <View style={styles.coinDisplay}>
          <Image source={require('@/assets/images/Coin.png')} style={styles.coinIcon} />
          <Text style={styles.currencyText}>{currency ?? 0}</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.shopTitle}>Shop</Text>
          <Text style={styles.subtitle}>Costumes & Seeds</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityLabel="Close shop">
          <Text style={styles.closeButtonText}>✖</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Enhanced Costumes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Costumes</Text>
            <View style={styles.sectionDivider} />
          </View>
          <FlatList
            data={OUTFITS}
            renderItem={renderOutfit}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.sectionContent}
          />
        </View>

        {/* Enhanced Seeds Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Seeds</Text>
            <View style={styles.sectionDivider} />
          </View>
          <FlatList
            data={SEEDS}
            renderItem={renderSeed}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.sectionContent}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F3E8' // Lighter, more elegant background
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#D28B2F',
    borderBottomWidth: 3,
    borderBottomColor: '#B8751F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  coinDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coinIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  coinImage: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  currencyText: { 
    color: '#ffffff', 
    fontSize: 16, 
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  titleContainer: {
    alignItems: 'center',
  },
  shopTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  spacer: {
    width: 80,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonText: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: '900',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sectionDivider: {
    width: 100,
    height: 3,
    backgroundColor: '#D28B2F',
    borderRadius: 2,
  },
  sectionContent: {
    gap: 12,
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8DCC0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  itemPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.05,
  },
  successGlow: {
    borderColor: '#4CAF50',
    backgroundColor: '#F8FFF8',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  itemImageContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  costumeImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  equippedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  equippedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  seedIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#FFF8DC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8DCC0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  seedImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  activeBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    backgroundColor: '#FF9800',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  itemInfo: {
    flex: 1,
    paddingRight: 12,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2C1810',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '700',
    marginBottom: 6,
  },
  seedDescription: {
    fontSize: 13,
    color: '#6B4E3D',
    fontStyle: 'italic',
    marginBottom: 6,
    lineHeight: 18,
  },
  ownedText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 3,
  },
  activeEffectText: {
    fontSize: 13,
    color: '#FF9800',
    fontWeight: '700',
    marginBottom: 3,
  },
  equippedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4CAF50',
  },
  buttonContainer: {
    minWidth: 90,
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#D28B2F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#B0B0B0',
    shadowOpacity: 0.1,
  },
  useButton: {
    backgroundColor: '#FF6347',
  },
  equipButton: {
    backgroundColor: '#4CAF50',
  },
  unequipButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
