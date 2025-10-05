// CurrencyContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface CurrencyContextType {
  currency: number;
  setCurrency: (val: number | ((prev: number) => number)) => void;
  add_currency: (val: number) => void;
  ownedOutfits: string[];
  setOwnedOutfits: (val: string[] | ((prev: string[]) => string[])) => void;
  currentOutfit: string;
  equipOutfit: (outfit: string) => boolean;
  ownedSeeds: {[key: string]: number};
  setOwnedSeeds: (val: {[key: string]: number} | ((prev: {[key: string]: number}) => {[key: string]: number})) => void;
  getPumpkinMultiplier: () => number;
  useSeed: (seedType: string) => void;
  activePumpkinBoost: boolean;
  pepperEffect: { active: boolean; tasksRemaining: number };
  completeTask: () => void;
}

const CurrencyContext = createContext<CurrencyContextType>({} as CurrencyContextType);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrency] = useState(200); // starting coins
  const [ownedOutfits, setOwnedOutfits] = useState<string[]>(['default']); // start with default outfit
  const [currentOutfit, setCurrentOutfit] = useState<string>('default');
  const [ownedSeeds, setOwnedSeeds] = useState<{[key: string]: number}>({});
  const [activePumpkinBoost, setActivePumpkinBoost] = useState(false);
  const [pepperEffect, setPepperEffect] = useState<{ active: boolean; tasksRemaining: number }>({ 
    active: false, 
    tasksRemaining: 0 
  });

  // Add/subtract coins
  const add_currency = (val: number) => {
    setCurrency(prev => prev + val);
  };

  // Equip an outfit if owned
  const equipOutfit = (outfit: string) => {
    if (!ownedOutfits.includes(outfit)) return false;
    setCurrentOutfit(outfit);
    return true;
  };

  // Calculate pumpkin spawn multiplier based on active boost
  const getPumpkinMultiplier = () => {
    return activePumpkinBoost ? 2 : 1;
  };

  // Use a seed (consume it and activate its effect)
  const useSeed = (seedType: string) => {
    if ((ownedSeeds[seedType] || 0) <= 0) return;

    // Consume the seed
    setOwnedSeeds(prev => ({ 
      ...prev, 
      [seedType]: Math.max(0, (prev[seedType] || 0) - 1) 
    }));

    // Activate the effect
    if (seedType === 'pumpkin') {
      setActivePumpkinBoost(true);
    } else if (seedType === 'pepper') {
      setPepperEffect({ active: true, tasksRemaining: 2 });
    }
  };

  // Complete a task (decrements pepper effect if active)
  const completeTask = () => {
    if (pepperEffect.active && pepperEffect.tasksRemaining > 0) {
      const newTasksRemaining = pepperEffect.tasksRemaining - 1;
      if (newTasksRemaining <= 0) {
        setPepperEffect({ active: false, tasksRemaining: 0 });
      } else {
        setPepperEffect({ active: true, tasksRemaining: newTasksRemaining });
      }
    }
    
    // Reset pumpkin boost after use (single-use)
    if (activePumpkinBoost) {
      setActivePumpkinBoost(false);
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        add_currency,
        ownedOutfits,
        setOwnedOutfits,
        currentOutfit,
        equipOutfit,
        ownedSeeds,
        setOwnedSeeds,
        getPumpkinMultiplier,
        useSeed,
        activePumpkinBoost,
        pepperEffect,
        completeTask,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

// Hook for components
export const useCurrency = () => useContext(CurrencyContext);
